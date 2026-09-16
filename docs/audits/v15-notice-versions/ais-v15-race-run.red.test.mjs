import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {harness} from '/Users/bigmac_moon/dev/ai_score/site/tests/api-harness.mjs';

const root='/Users/bigmac_moon/dev/ai_score/site';
const read=p=>fs.readFileSync(root+'/'+p,'utf8');
const files=['lib/notice-candidates.ts','lib/notice-sources.ts','lib/notifications.ts','lib/email-delivery.ts','tests/api-harness.mjs','app/api/workspace/route.ts','data/promotions.json','data/catalog.json'];
const hashes=()=>Object.fromEntries(files.map(p=>[p,createHash('sha256').update(read(p)).digest('hex')]));
const before=hashes();
console.log('BASELINE '+JSON.stringify({checkedAt:new Date().toISOString(),hashes:before,network:'provider mocks only',source:'actual modules + in-memory SQLite; no Site writes'}));
const source=JSON.parse(read('data/promotions.json')),catalogSource=JSON.parse(read('data/catalog.json'));
const cardKey='promotion:local-race-offer';
const plain=x=>JSON.parse(JSON.stringify(x));
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};}
function gate(){const entered=deferred(),released=deferred();return {entered:entered.promise,release:released.resolve,async stop(){entered.resolve();await released.promise;}};}
function adapter(base){
 const meta=new WeakMap();let intercept=null,readIntercept=null;
 async function beforeRead(q,p){if(readIntercept&&readIntercept.match({q,p})){const active=readIntercept;readIntercept=null;await active.gate.stop();}}
 function statement(q,p=[]){const original=base.prepare(q).bind(...p);const s={...original,bind(...values){return statement(q,values);},async all(){await beforeRead(q,p);return original.all();},async first(){await beforeRead(q,p);return original.first();}};meta.set(s,{q,p});return s;}
 const DB={prepare:statement,async batch(statements){const rows=statements.map(s=>meta.get(s));if(intercept&&intercept.match(rows)){const active=intercept;intercept=null;await active.gate.stop();}return base.batch(statements);}};
 return {DB,pause(match){assert.equal(intercept,null);const g=gate();intercept={match,gate:g};return g;},pauseRead(match){assert.equal(readIntercept,null);const g=gate();readIntercept={match,gate:g};return g;}};
}
async function fixture({mode='matched',count=1,provider}={}){
 let clock='2026-09-12T10:00:00.000Z';const requests=[];
 const offers=Array.from({length:count},(_,i)=>({...structuredClone(source[0]),id:i?'local-race-offer-'+i:'local-race-offer',toolId:'gemini',name:'LOCAL RACE OFFER '+i,summary:'Local fixture; not an official offer',revision:1,status:'active',reviewStatus:'verified',expiresAt:'2026-12-31',expiresInstant:null,expiresTimeZone:null,price:{amount:0,currency:'USD',period:'month',tax:'included'},renewalPrice:{amount:20,currency:'USD',period:'month',tax:'included'},benefitMonths:12,offerFeatures:[{id:'document-analysis',status:'supported',condition:'',sourceUrl:'https://example.invalid/feature'}]}));
 const catalog=structuredClone(catalogSource),fetcher=async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');const r={payload:JSON.parse(options.body),raw:options.body,key:options.headers['Idempotency-Key']};requests.push(r);return provider?provider(r,requests.length):Response.json({id:'mock-'+requests.length});};
 const h=harness(fetcher,{now:()=>clock,jsonFixtures:{'data/promotions.json':offers,'data/catalog.json':catalog}}),baseDB=h.env.DB,control=adapter(baseDB);h.env.DB=control.DB;
 const facts=h.load('lib/promotion-facts.ts'),base={interests:['gemini'],includeAlternatives:false,inApp:true,email:true,emailMode:mode,emailTimeZone:'UTC',emailTime:'00:00',hiddenTopics:['update:gemini'],promotionEligibility:Object.fromEntries(offers.map(p=>[p.id,'eligible'])),promotionEligibilityVersions:Object.fromEntries(offers.map(p=>[p.id,facts.eligibilityFingerprint(p)]))};
 const saved=await h.save('settings',base);assert.equal(saved.status,200,JSON.stringify(saved.data));assert.equal(saved.data.record.payload.emailTimingConfirmed,true);
 // Server owns hiddenTopics; preload that existing private preference only in the in-memory fixture.
 h.sql.prepare("UPDATE private_records SET payload=json_set(payload,'$.hiddenTopics',json(?)) WHERE user_id=? AND kind='settings'").run(JSON.stringify(['update:gemini']),'alpha');
 const n=h.load('lib/notifications.ts');
 const candidates=await n.currentNotices('alpha');assert.equal(candidates.notices.length,count);assert.ok(candidates.notices.every(n=>n.emailAllowed),'valid fixture before the race');
 return {h,n,offers,p:offers[0],catalog,base,baseDB,control,requests,at:v=>clock=v,async run(){await n.generateNotifications('alpha');return n.deliverEmailForUser('alpha');},worker(newOffers=structuredClone(offers)){
   const w=harness(fetcher,{now:()=>clock,jsonFixtures:{'data/promotions.json':newOffers,'data/catalog.json':structuredClone(catalog)}});const c=adapter(baseDB);w.env.DB=c.DB;return {h:w,n:w.load('lib/notifications.ts'),offers:newOffers,control:c};
 }};
}
const one=(f,q,...p)=>plain(f.h.sql.prepare(q).get(...p)||null);
const all=(f,q,...p)=>plain(f.h.sql.prepare(q).all(...p));
const card=f=>one(f,'SELECT * FROM notification_cards WHERE user_id=? AND card_key=?','alpha',cardKey);
const head=f=>one(f,'SELECT * FROM notice_source_heads WHERE card_key=?',cardKey);
const queues=f=>all(f,"SELECT o.* FROM email_outbox o JOIN notifications n ON n.id=o.notification_id WHERE o.user_id='alpha' AND n.source_key LIKE 'promotion:%' ORDER BY o.id");
const deliveries=f=>all(f,"SELECT * FROM email_deliveries WHERE user_id='alpha' ORDER BY id");
const state=f=>one(f,"SELECT * FROM email_dispatch_state WHERE user_id='alpha'");
const rowsContain=(rows,sql)=>rows.some(r=>r?.q.includes(sql));
const notifyWrite=rows=>rowsContain(rows,'INSERT OR IGNORE INTO notifications')&&rows.some(r=>r.p.some(p=>typeof p==='string'&&p.startsWith(cardKey+':')));
const planWrite=rows=>rowsContain(rows,'INSERT INTO email_deliveries');
const attemptWrite=rows=>rowsContain(rows,"UPDATE email_deliveries SET status='sending'");
const observation=(t,data)=>t.diagnostic(JSON.stringify(data));

test('R2 checkedAt-only and explicit revision-only preserve sent/read/card identity',{timeout:10000},async t=>{
 const f=await fixture();await f.run();assert.equal(f.requests.length,1);const c1=card(f),receipt=deliveries(f),history=all(f,'SELECT * FROM notifications WHERE user_id=?','alpha');
 f.h.sql.prepare('UPDATE notification_cards SET read=1 WHERE id=?').run(c1.id);
 f.p.checkedAt='2026-09-13';f.at('2026-09-13T10:00:00Z');await f.run();const c2=card(f);
 f.p.revision=2;f.at('2026-09-14T10:00:00Z');await f.run();const c3=card(f);
 observation(t,{requests:f.requests.length,cardIds:[c1.id,c2.id,c3.id],read:c3.read,sourceRevision:c3.source_revision,headRevision:head(f).revision});
 assert.equal(f.requests.length,1);assert.equal(c3.id,c1.id);assert.equal(c3.latest_notification_id,c1.latest_notification_id);assert.equal(c3.read,1);assert.equal(c3.source_revision,2);assert.equal(head(f).revision,2);assert.deepEqual(deliveries(f),receipt);assert.deepEqual(all(f,'SELECT * FROM notifications WHERE user_id=?','alpha'),history);
});

test('R3 paused old generator cannot regress newer head/card or queue',{timeout:10000},async t=>{
 const f=await fixture();await f.n.generateNotifications('alpha');const pause=f.control.pause(notifyWrite);const old=f.n.generateNotifications('alpha');await pause.entered;
 const current=f.worker();current.offers[0].revision=2;current.offers[0].price.amount=5;await current.n.generateNotifications('alpha');const expected={card:card(f),head:head(f),queues:queues(f)};
 pause.release();await old;observation(t,{head:head(f),cardRevision:card(f).source_revision,queues:queues(f).map(x=>({status:x.status,attempts:x.attempts})),requests:f.requests.length});
 assert.deepEqual(card(f),expected.card);assert.deepEqual(head(f),expected.head);assert.deepEqual(queues(f),expected.queues);assert.equal(f.requests.length,0);
});

for(const mode of ['matched','digest'])test(`R3/R4 old deployed worker must not cancel the newer reviewed queue (${mode})`,{timeout:10000},async t=>{
 const f=await fixture({mode});await f.n.generateNotifications('alpha');const current=f.worker();current.offers[0].revision=2;current.offers[0].price.amount=5;await current.n.generateNotifications('alpha');const expectedCard=card(f),newId=expectedCard.latest_notification_id;
 const beforeQueue=one(f,'SELECT * FROM email_outbox WHERE notification_id=?',newId);assert.equal(beforeQueue.status,'queued');
 const result=await f.n.deliverEmailForUser('alpha');const afterQueue=one(f,'SELECT * FROM email_outbox WHERE notification_id=?',newId);
 const staleState=state(f),staleRequests=f.requests.length;
 await current.n.generateNotifications('alpha');const newWorkerResult=await current.n.deliverEmailForUser('alpha');
 observation(t,{mode,oldWorkerResult:result,beforeQueue:beforeQueue.status,afterQueue:afterQueue.status,queueError:afterQueue.error,headRevision:head(f).revision,cardRevision:card(f).source_revision,staleRequests,staleNextDigest:staleState?.next_digest_not_before,staleDigestOutcome:staleState?.last_digest_outcome,newWorkerResult,totalRequests:f.requests.length});
 assert.equal(staleRequests,0);assert.deepEqual(card(f),expectedCard);assert.equal(afterQueue.status,'queued','a stale module must not revoke the newer source queue');
 if(mode==='digest')assert.equal(staleState.next_digest_not_before,null,'an obsolete deployment cannot consume the current daily slot');
 assert.equal(newWorkerResult.sent,1,'the current reviewed queue remains available to the newer worker');
});

test('R8 source changes after candidate read before pending-queue scan: latest queue and daily slot remain intact',{timeout:10000},async t=>{
 const f=await fixture({mode:'digest'});await f.n.generateNotifications('alpha');
 const pause=f.control.pauseRead(({q})=>q.startsWith('SELECT o.id,o.notification_id,n.source_key'));
 const stale=f.n.deliverEmailForUser('alpha');await pause.entered;
 const current=f.worker();current.offers[0].revision=2;current.offers[0].price.amount=5;await current.n.generateNotifications('alpha');const currentId=card(f).latest_notification_id;
 assert.equal(one(f,'SELECT status FROM email_outbox WHERE notification_id=?',currentId).status,'queued');
 pause.release();const result=await stale;const currentQueue=one(f,'SELECT status,error,attempts FROM email_outbox WHERE notification_id=?',currentId),dispatch=state(f);
 observation(t,{result,currentQueue,dispatchOutcome:dispatch.last_digest_outcome,nextDigest:dispatch.next_digest_not_before,requests:f.requests.length,headRevision:head(f).revision});
 assert.equal(currentQueue.status,'queued','queue cleanup cannot revoke a version newer than its candidate snapshot');assert.equal(dispatch.next_digest_not_before,null);assert.equal(f.requests.length,0);
});

for(const stage of ['plan','attempt'])for(const mutation of ['head','settings'])test(`R8 ${mutation} advances after reads before ${stage} CAS: no dependent write/provider/slot`,{timeout:10000},async t=>{
 const f=await fixture({mode:'digest'});await f.n.generateNotifications('alpha');assert.equal(queues(f).length,1);
 const pause=f.control.pause(stage==='plan'?planWrite:attemptWrite);const sending=f.n.deliverEmailForUser('alpha');await pause.entered;
 if(mutation==='head'){const current=f.worker();current.offers[0].revision=2;current.offers[0].price.amount=5;await current.n.currentNotices('alpha');}
 else {const saved=await f.h.save('settings',{...f.base,email:false});assert.equal(saved.status,200);}
 pause.release();const result=await sending;const d=deliveries(f),q=queues(f),s=state(f);
 observation(t,{stage,mutation,result,delivery:d.map(x=>({status:x.status,attempts:x.attempts})),outbox:q.map(x=>({status:x.status,attempts:x.attempts})),digest:s?.last_digest_outcome,requests:f.requests.length});
 assert.equal(f.requests.length,0);assert.ok(d.every(x=>x.attempts===0&&x.status!=='sending'));assert.ok(q.every(x=>x.attempts===0&&x.status!=='sending'));assert.equal(s?.next_digest_not_before,null);assert.equal(s?.last_digest_outcome,null);if(stage==='plan')assert.equal(d.length,0);
});

for(const missing of ['head','card','foreign-pointer'])test(`R9 multi-item attempt fails closed for ${missing}`,{timeout:10000},async t=>{
 const f=await fixture({mode:'digest',count:2});await f.n.generateNotifications('alpha');assert.equal(queues(f).length,2);
 let foreign;
 if(missing==='foreign-pointer'){f.h.user({userId:'beta',email:'beta@example.invalid'});assert.equal((await f.h.save('settings',f.base)).status,200);await f.n.generateNotifications('beta');foreign=one(f,'SELECT latest_notification_id FROM notification_cards WHERE user_id=? AND card_key=?','beta',cardKey).latest_notification_id;f.h.user({userId:'alpha',email:'alpha@example.invalid'});}
 const pause=f.control.pause(attemptWrite);const sending=f.n.deliverEmailForUser('alpha');await pause.entered;const prepared=deliveries(f);assert.equal(prepared.length,1);assert.equal(JSON.parse(prepared[0].items).length,2);
 if(missing==='head')f.h.sql.prepare('DELETE FROM notice_source_heads WHERE card_key=?').run(cardKey);
 if(missing==='card')f.h.sql.prepare('DELETE FROM notification_cards WHERE user_id=? AND card_key=?').run('alpha',cardKey);
 if(missing==='foreign-pointer')f.h.sql.prepare('UPDATE notification_cards SET latest_notification_id=? WHERE user_id=? AND card_key=?').run(foreign,'alpha',cardKey);
 pause.release();await sending;observation(t,{missing,requests:f.requests.length,delivery:deliveries(f).map(d=>({status:d.status,attempts:d.attempts})),outbox:queues(f).map(d=>({status:d.status,attempts:d.attempts})),slot:state(f)?.next_digest_not_before});
 assert.equal(f.requests.length,0);assert.equal(deliveries(f)[0].attempts,0);assert.ok(queues(f).every(q=>q.attempts===0));assert.equal(state(f)?.next_digest_not_before,null);
});

test('R10 late accepted old request retains receipt and immutable payload without regressing latest card',{timeout:10000},async t=>{
 const providerGate=gate(),f=await fixture({provider:async(r,count)=>{if(count===1){await providerGate.stop();return Response.json({id:'mock-late-r1'});}return Response.json({id:'mock-r2'});}});
 await f.n.generateNotifications('alpha');const sending=f.n.deliverEmailForUser('alpha');await providerGate.entered;const oldRequest=structuredClone(f.requests[0]);const oldDelivery=deliveries(f)[0];
 const current=f.worker();current.offers[0].revision=2;current.offers[0].price.amount=5;await current.n.generateNotifications('alpha');const latest=card(f);assert.equal(latest.source_revision,2);assert.notEqual(latest.latest_notification_id,JSON.parse(oldDelivery.items)[0].notificationId);
 providerGate.release();const result=await sending;const accepted=one(f,'SELECT * FROM email_deliveries WHERE id=?',oldDelivery.id);
 assert.equal(result.sent,1);assert.equal(accepted.status,'accepted');assert.equal(accepted.provider_id,'mock-late-r1');assert.equal(accepted.payload,oldDelivery.payload);assert.deepEqual(card(f),latest);assert.deepEqual(f.requests[0],oldRequest);
 await current.n.deliverEmailForUser('alpha');observation(t,{oldStatus:accepted.status,oldProviderId:accepted.provider_id,cardRevision:card(f).source_revision,requests:f.requests.length,requestKeys:f.requests.map(r=>r.key)});
 assert.equal(f.requests.length,2);assert.notEqual(f.requests[0].key,f.requests[1].key);assert.match(f.requests[1].payload.text,/정정/);assert.deepEqual(f.requests[0],oldRequest);assert.deepEqual(card(f),latest);
});

async function betaSnapshot(f){f.h.user({userId:'beta',email:'beta@example.invalid'});assert.equal((await f.h.save('settings',f.base)).status,200);await f.n.generateNotifications('beta');f.h.user({userId:'alpha',email:'alpha@example.invalid'});return Object.fromEntries(['private_records','notifications','notification_cards','email_outbox'].map(table=>[table,all(f,`SELECT * FROM ${table} WHERE user_id='beta' ORDER BY id`)]));}
function assertDeleted(f,beta){for(const table of ['private_records','notifications','notification_cards','email_outbox','email_deliveries','email_dispatch_state'])assert.equal(one(f,`SELECT COUNT(*) n FROM ${table} WHERE user_id='alpha'`).n,0,table);for(const[table,rows]of Object.entries(beta))assert.deepEqual(all(f,`SELECT * FROM ${table} WHERE user_id='beta' ORDER BY id`),rows,table);assert.ok(head(f),'shared public head preserved');}

test('P6 late generator after deletion cannot recreate private data or delete shared head/Beta',{timeout:10000},async t=>{
 const f=await fixture();await f.n.generateNotifications('alpha');const beta=await betaSnapshot(f),pause=f.control.pause(notifyWrite);const generating=f.n.generateNotifications('alpha');await pause.entered;
 const removed=await f.h.call(f.h.workspace.DELETE,{confirmation:'내 기록 삭제'},'DELETE');assert.equal(removed.status,200);pause.release();await generating;await f.n.deliverEmailForUser('alpha');assertDeleted(f,beta);
 observation(t,{requests:f.requests.length,alphaCards:one(f,"SELECT COUNT(*) n FROM notification_cards WHERE user_id='alpha'").n,betaCards:one(f,"SELECT COUNT(*) n FROM notification_cards WHERE user_id='beta'").n,sharedHead:head(f)});assert.equal(f.requests.length,0);
});

test('P6 late provider receipt after deletion cannot recreate private data or affect Beta',{timeout:10000},async t=>{
 const providerGate=gate(),f=await fixture({provider:async()=>{await providerGate.stop();return Response.json({id:'mock-after-delete'});}});await f.n.generateNotifications('alpha');const beta=await betaSnapshot(f);const sending=f.n.deliverEmailForUser('alpha');await providerGate.entered;
 assert.equal((await f.h.call(f.h.workspace.DELETE,{confirmation:'내 기록 삭제'},'DELETE')).status,200);providerGate.release();const result=await sending;assertDeleted(f,beta);observation(t,{result,requests:f.requests.length,privateAlphaRows:0,betaCards:one(f,"SELECT COUNT(*) n FROM notification_cards WHERE user_id='beta'").n});assert.equal(f.requests.length,1);assert.equal(result.sent,0);
});

test('source snapshot stability (detect concurrent parent edits, not a product behavior gate)',t=>{const after=hashes();observation(t,{before,after,changed:files.filter(p=>before[p]!==after[p])});assert.deepEqual(after,before);});
