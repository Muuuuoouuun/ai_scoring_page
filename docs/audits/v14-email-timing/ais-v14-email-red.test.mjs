import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash, randomUUID} from 'node:crypto';
import {harness} from '/Users/bigmac_moon/dev/ai_score/site/tests/api-harness.mjs';

const root='/Users/bigmac_moon/dev/ai_score/site';
const checkedAt=new Date().toISOString();
const sourceHashes=Object.fromEntries(['lib/notifications.ts','app/api/workspace/route.ts','db/schema.ts','tests/api-harness.mjs'].map(p=>[p,createHash('sha256').update(fs.readFileSync(root+'/'+p)).digest('hex')]));
const evidence=[];
const settings={interests:['chatgpt'],includeAlternatives:false,inApp:true,email:true};
function recordTest(name,fn){test(name,async()=>{const observation={name};try{await fn(observation);observation.result='PASS';}catch(e){observation.result='RED';observation.assertion=e.message;throw e;}finally{evidence.push(observation);}});}
after(()=>fs.writeFileSync('/private/tmp/ais-v14-email-red.json',JSON.stringify({checkedAt,scope:'Local in-memory API harness, explicit fetch mocks only, zero network or real email',sourceHashes,evidence},null,2)+'\n'));
function outbox(h){return h.sql.prepare('SELECT * FROM email_outbox ORDER BY id').all();}
function seed(h,user,status,attempts=0){const notificationId=randomUUID(),id=randomUUID();h.sql.prepare('INSERT INTO notifications(id,user_id,source_key,title,body,href,read,created_at) VALUES(?,?,?,?,?,?,0,?)').run(notificationId,user,'test:'+id,'Local test','Local body','/news',new Date().toISOString());h.sql.prepare('INSERT INTO email_outbox(id,user_id,notification_id,status,attempts,created_at) VALUES(?,?,?,?,?,?)').run(id,user,notificationId,status,attempts,new Date().toISOString());return id;}
async function configured(fetcher){const h=harness(fetcher);const saved=await h.save('settings',settings);assert.equal(saved.status,200);const n=h.load('lib/notifications.ts');return {h,n,settingsId:saved.data.record.id};}
async function queued(fetcher,attempts=0){const f=await configured(fetcher);await f.n.generateNotifications('alpha');assert.equal(outbox(f.h).length,1,'fixture must have one valid eligible update');if(attempts)f.h.sql.prepare("UPDATE email_outbox SET attempts=?,status='failed'").run(attempts);return f;}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function barrier(){let release;const promise=new Promise(resolve=>{release=resolve;});return {promise,release};}

recordTest('RED: email:false cancels own queued/failed before settings save returns',async o=>{
 const {h,settingsId}=await configured();const own={};for(const status of ['queued','failed','sent','needs_review','cancelled'])own[status]=seed(h,'alpha',status);const other=[seed(h,'beta','queued'),seed(h,'beta','failed')];
 const r=await h.save('settings',{...settings,email:false},settingsId);o.httpStatus=r.status;o.savedEmail=h.record(settingsId).email;o.rows=outbox(h).map(({user_id,status,id})=>({user_id,status,seedState:Object.entries(own).find(([,v])=>v===id)?.[0]||'other'}));
 assert.equal(r.status,200);assert.equal(h.record(settingsId).email,false);
 assert.equal(h.sql.prepare('SELECT status FROM email_outbox WHERE id=?').get(own.sent).status,'sent');assert.equal(h.sql.prepare('SELECT status FROM email_outbox WHERE id=?').get(own.needs_review).status,'needs_review');
 assert.deepEqual(other.map(id=>h.sql.prepare('SELECT status FROM email_outbox WHERE id=?').get(id).status),['queued','failed']);
 assert.deepEqual(['queued','failed'].map(k=>h.sql.prepare('SELECT status FROM email_outbox WHERE id=?').get(own[k]).status),['cancelled','cancelled']);
});

recordTest('RED: cancellation failure rolls back email:false in the same transaction',async o=>{
 const {h,settingsId}=await configured();seed(h,'alpha','queued');h.sql.exec("CREATE TRIGGER fail_test_cancellation BEFORE UPDATE OF status ON email_outbox WHEN NEW.status='cancelled' BEGIN SELECT RAISE(ABORT,'LOCAL_TEST_CANCEL_FAILURE'); END");
 const r=await h.save('settings',{...settings,email:false},settingsId);o.httpStatus=r.status;o.savedEmail=h.record(settingsId).email;o.outboxStatus=outbox(h)[0].status;
 assert.equal(h.record(settingsId).email,true,'email consent update must roll back when atomic cancellation fails');assert.ok(r.status>=400,'failed transaction must not report success');assert.equal(outbox(h)[0].status,'queued');
});

recordTest('RED: successful provider id survives in the outbox record',async o=>{
 let requests=0;const providerId='local-provider-id-'+randomUUID();const {h,n}=await queued(async url=>{assert.equal(url,'https://api.resend.com/emails');requests++;return Response.json({id:providerId});});
 const result=await n.deliverEmailForUser('alpha');const row=outbox(h)[0];o.requests=requests;o.resultSummary=result;o.rowKeys=Object.keys(row);o.status=row.status;o.providerIdPersisted=JSON.stringify(row).includes(providerId);
 assert.equal(result.sent,1);assert.equal(row.status,'sent');assert.ok(row.sent_at);assert.equal(o.providerIdPersisted,true,'provider receipt id must be durable, regardless of chosen column name');
});

recordTest('RED: concurrent deliver calls make at most one in-flight provider request per row',async o=>{
 const gate=barrier(),entered=barrier();const calls=[];const {h,n}=await queued(async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');calls.push({key:options.headers['Idempotency-Key']});entered.release();await gate.promise;return Response.json({id:'local-concurrent-id'});});
 const tasks=[n.deliverEmailForUser('alpha'),n.deliverEmailForUser('alpha')];await entered.promise;await tick();o.requestsBeforeRelease=calls.length;o.attemptsBeforeRelease=outbox(h)[0].attempts;gate.release();o.results=await Promise.all(tasks);o.finalStatus=outbox(h)[0].status;o.keys=calls.map(c=>c.key);
 assert.equal(calls.length,1,'concurrent workers must not both dispatch the same row');
});

recordTest('RED: two concurrent retries from attempts=2 do not exceed the three-attempt ceiling',async o=>{
 const gate=barrier(),entered=barrier();let calls=0;const {h,n}=await queued(async()=>{calls++;entered.release();await gate.promise;return Response.json({error:'Local transient failure'},{status:503});},2);
 const tasks=[n.deliverEmailForUser('alpha'),n.deliverEmailForUser('alpha')];await entered.promise;await tick();gate.release();await Promise.all(tasks);const row=outbox(h)[0];o.providerRequests=calls;o.initialAttempts=2;o.finalAttempts=row.attempts;o.finalStatus=row.status;
 assert.ok(row.attempts<=3,'attempt ceiling must be enforced by the write/claim, not only the earlier SELECT');assert.equal(calls,1);
});

recordTest('RED: a late concurrent provider failure cannot overwrite an accepted sent row',async o=>{
 const gates=[barrier(),barrier()],entered=barrier();let calls=0;const {h,n}=await queued(async()=>{const index=calls++;entered.release();assert.ok(index<2);await gates[index].promise;return index===0?Response.json({id:'local-success-id'}):Response.json({error:'Local concurrent conflict'},{status:409});});
 const tasks=[n.deliverEmailForUser('alpha'),n.deliverEmailForUser('alpha')];await entered.promise;await tick();o.providerRequests=calls;gates[0].release();await tick();o.statusAfterFirstSuccess=outbox(h)[0].status;gates[1].release();o.results=await Promise.all(tasks);o.finalStatus=outbox(h)[0].status;o.finalAttempts=outbox(h)[0].attempts;
 assert.equal(o.statusAfterFirstSuccess,'sent');assert.equal(o.finalStatus,'sent','stale failure must not replace an already accepted send');
});

recordTest('CONTROL: existing send-time consent recheck blocks provider dispatch after opt-out',async o=>{
 let calls=0;const {h,n,settingsId}=await queued(async()=>{calls++;return Response.json({id:'must-not-send'});});await h.save('settings',{...settings,email:false},settingsId);const r=await n.deliverEmailForUser('alpha');o.providerRequests=calls;o.resultSummary=r;o.finalStatus=outbox(h)[0].status;assert.equal(calls,0);assert.equal(r.sent,0);assert.equal(o.finalStatus,'cancelled');
});
