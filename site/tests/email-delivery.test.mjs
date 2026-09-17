import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';

const preferences={interests:['chatgpt'],includeAlternatives:false,inApp:true,email:true,emailMode:'digest',emailTimeZone:'Asia/Seoul',emailTime:'09:00'};
const accepted=id=>new Response(JSON.stringify({id}),{status:200});
async function fixture(interests=['chatgpt'],mode='digest',fetcher=()=>accepted('provider-test')){
 let clock='2026-09-12T00:00:00.000Z';const h=harness(fetcher,{now:()=>clock});
 const saved=await h.save('settings',{...preferences,interests,emailMode:mode});assert.equal(saved.status,200);
 const n=h.load('lib/notifications.ts');await n.generateNotifications('alpha');
 return {h,n,saved,at:value=>{clock=value;}};
}
function pauseRead(h,fragment,method='first'){
 let enter,release,used=false;const entered=new Promise(r=>{enter=r;}),gate=new Promise(r=>{release=r;});
 const original=h.env.DB.prepare.bind(h.env.DB);
 h.env.DB.prepare=q=>{const wrap=s=>({...s,bind(...args){return wrap(s.bind(...args));},async [method](){const result=await s[method]();if(!used&&q.includes(fragment)){used=true;enter();await gate;}return result;}});return wrap(original(q));};
 return {entered,release:()=>release()};
}

test('email mode, named time zone and receiving time survive the actual settings route',async()=>{
 const h=harness();
 const r=await h.save('settings',{...preferences,emailMode:'matched',emailTimeZone:'America/New_York',emailTime:'20:15'});
 assert.equal(r.status,200);
 const list=await h.call(h.workspace.GET,null,'GET');
 const saved=list.data.records.find(r=>r.kind==='settings').payload;
 assert.equal(saved.emailMode,'matched');
 assert.equal(saved.emailTimeZone,'America/New_York');
 assert.equal(saved.emailTime,'20:15');
 assert.equal(saved.emailAddress,'alpha@example.invalid');
});

test('invalid named time zone or wall time is rejected rather than silently defaulted',async()=>{
 const h=harness();
 for(const fields of [{emailTimeZone:'Not/AZone'},{emailTimeZone:'+09:00'},{emailTime:'24:00'},{emailTime:'9:00'},{emailMode:'instant'}]){
  assert.equal((await h.save('settings',{...preferences,...fields})).status,400,JSON.stringify(fields));
 }
 assert.equal(h.sql.prepare("SELECT COUNT(*) n FROM private_records WHERE kind='settings'").get().n,0);
});

test('opting out atomically cancels queued email before returning without changing another account',async()=>{
 const h=harness();const a=await h.save('settings',preferences);const n=h.load('lib/notifications.ts');await n.generateNotifications('alpha');
 h.user({userId:'beta',email:'beta@example.invalid'});await h.save('settings',preferences);await n.generateNotifications('beta');
 h.user({userId:'alpha',email:'alpha@example.invalid'});const r=await h.save('settings',{...preferences,email:false},a.data.record.id);
 assert.equal(r.status,200);
 assert.equal(h.sql.prepare("SELECT status FROM email_outbox WHERE user_id='alpha'").get().status,'cancelled');
 assert.equal(h.sql.prepare("SELECT status FROM email_outbox WHERE user_id='beta'").get().status,'queued');
});

test('an outbox cancellation failure rolls back the settings change in the same transaction',async()=>{
 const h=harness();const a=await h.save('settings',preferences);await h.load('lib/notifications.ts').generateNotifications('alpha');
 h.sql.exec("CREATE TRIGGER fail_cancellation BEFORE UPDATE OF status ON email_outbox WHEN NEW.status='cancelled' BEGIN SELECT RAISE(ABORT,'Local controlled cancellation failure'); END");
 const r=await h.save('settings',{...preferences,email:false},a.data.record.id);
 assert.ok(r.status>=400);
 assert.equal(h.record(a.data.record.id).email,true);
 assert.equal(h.sql.prepare('SELECT status FROM email_outbox').get().status,'queued');
});

test('one digest includes all new notices once and persists the provider receipt',async()=>{
 const calls=[];const {h,n}=await fixture(['chatgpt','claude'],'digest',(_url,init)=>{calls.push(init);return accepted('receipt-1');});
 const before=h.sql.prepare('SELECT COUNT(*) n FROM email_outbox').get().n;assert.equal(before,2);
 assert.equal((await n.deliverEmailForUser('alpha')).sent,1);
 assert.equal(calls.length,1);const payload=JSON.parse(calls[0].body);assert.match(payload.text,/ChatGPT/);assert.match(payload.text,/Claude/);
 assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM email_outbox WHERE provider_id=?').get('receipt-1').n,2);
 const row=h.sql.prepare('SELECT * FROM email_deliveries').get();assert.equal(row.status,'accepted');assert.equal(row.provider_id,'receipt-1');assert.ok(row.accepted_at);
 assert.equal((await n.deliverEmailForUser('alpha')).sent,0);assert.equal(calls.length,1);
});

test('receiving time is honored and a consumed or empty digest waits until the next local date',async()=>{
 const calls=[];const {h,n,saved,at}=await fixture([],'digest',(_u,i)=>{calls.push(i);return accepted('digest');});
 at('2026-09-11T23:59:59Z');assert.equal((await n.deliverEmailForUser('alpha')).sent,0);
 at('2026-09-12T00:00:00Z');await n.deliverEmailForUser('alpha');assert.equal(calls.length,0);
 at('2026-09-12T01:00:00Z');await h.save('settings',{...preferences},saved.data.record.id);await n.generateNotifications('alpha');
 assert.equal((await n.deliverEmailForUser('alpha')).sent,0);assert.equal(calls.length,0);
 at('2026-09-13T00:00:00Z');assert.equal((await n.deliverEmailForUser('alpha')).sent,1);
});

test('matched batches have a rolling 24-hour cap that persists across mode and zone changes',async()=>{
 const calls=[];const {h,n,saved,at}=await fixture(['chatgpt'],'matched',(_u,i)=>{calls.push(i);return accepted('cap-'+calls.length);});
 await n.deliverEmailForUser('alpha');
 for(const [clock,interests] of [['2026-09-12T01:00Z',['chatgpt','claude']],['2026-09-12T02:00Z',['chatgpt','claude','perplexity']],['2026-09-12T03:00Z',['chatgpt','claude','perplexity','notion']]]){
  at(clock);await h.save('settings',{...preferences,interests,emailMode:'matched'},saved.data.record.id);await n.generateNotifications('alpha');await n.deliverEmailForUser('alpha');
 }
 assert.equal(calls.length,3);assert.equal(h.sql.prepare("SELECT COUNT(*) n FROM email_outbox WHERE status='queued'").get().n,1);
 await h.save('settings',{...preferences,interests:['chatgpt','claude','perplexity','notion'],emailMode:'matched',emailTimeZone:'Pacific/Kiritimati',emailTime:'00:00'},saved.data.record.id);
 await n.deliverEmailForUser('alpha');assert.equal(calls.length,3);
 at('2026-09-13T00:00Z');assert.equal((await n.deliverEmailForUser('alpha')).sent,1);assert.equal(calls.length,4);
});

test('legacy unconfirmed timing never sends; explicit time confirmation enables the current slot',async()=>{
 let count=0;const {h,n,saved}=await fixture(['chatgpt'],'digest',()=>{count++;return accepted('confirmed');});
 h.sql.prepare("UPDATE private_records SET payload=json_remove(payload,'$.emailTimingConfirmed','$.emailMode','$.emailTimeZone','$.emailTime') WHERE id=?").run(saved.data.record.id);
 assert.equal((await n.deliverEmailForUser('alpha')).sent,0);assert.equal(count,0);
 await h.save('settings',preferences,saved.data.record.id);assert.equal((await n.deliverEmailForUser('alpha')).sent,1);
});

test('parallel refresh claims one batch and makes only one first provider request',{timeout:5000},async()=>{
 let enter,release;const entered=new Promise(r=>{enter=r;}),gate=new Promise(r=>{release=r;});let count=0;
 const {h,n}=await fixture(['chatgpt'],'digest',async()=>{count++;if(count===1){enter();await gate;}return accepted('parallel');});
 const first=n.deliverEmailForUser('alpha');await entered;
 const second=await n.deliverEmailForUser('alpha');release();const result=await first;
 assert.equal(count,1);assert.equal(second.sent,0);assert.equal(result.sent,1);
 assert.equal(h.sql.prepare('SELECT attempts FROM email_deliveries').get().attempts,1);
});

test('retry keeps exact bytes and key, honors backoff, and starts its window at first attempt',async()=>{
 const calls=[];const {h,n,at}=await fixture(['chatgpt'],'digest',(_u,i)=>{calls.push(i);return calls.length===1?new Response('busy',{status:503}):accepted('retry');});
 h.sql.exec("UPDATE email_outbox SET created_at='2026-08-01T00:00:00.000Z'");
 await n.deliverEmailForUser('alpha');await n.deliverEmailForUser('alpha');assert.equal(calls.length,1);
 h.env.EMAIL_FROM='changed@example.invalid';h.env.SITE_URL='https://changed.example.invalid';
 at('2026-09-12T00:01:00Z');assert.equal((await n.deliverEmailForUser('alpha')).sent,1);
 assert.equal(calls.length,2);assert.equal(calls[0].body,calls[1].body);assert.equal(calls[0].headers['Idempotency-Key'],calls[1].headers['Idempotency-Key']);
 const d=h.sql.prepare('SELECT * FROM email_deliveries').get();assert.equal(d.first_attempt_at,'2026-09-12T00:00:00.000Z');assert.equal(d.attempts,2);
});

test('provider attempts stop at three and an expired ambiguous retry never gets a fresh identity',async()=>{
 let calls=0;const {h,n,at}=await fixture(['chatgpt'],'matched',()=>{calls++;return new Response('busy',{status:503});});
 await n.deliverEmailForUser('alpha');at('2026-09-12T00:01Z');await n.deliverEmailForUser('alpha');at('2026-09-12T00:03Z');await n.deliverEmailForUser('alpha');at('2026-09-13T01:00Z');await n.deliverEmailForUser('alpha');
 assert.equal(calls,3);assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM email_deliveries').get().n,1);assert.equal(h.sql.prepare('SELECT status FROM email_deliveries').get().status,'needs_review');
});

test('a late failed attempt cannot overwrite a newer accepted receipt after lease replacement',{timeout:5000},async()=>{
 let enter,release;const entered=new Promise(r=>{enter=r;}),gate=new Promise(r=>{release=r;});const calls=[];
 const {h,n,at}=await fixture(['chatgpt'],'matched',async(_u,i)=>{calls.push(i);if(calls.length===1){enter();await gate;throw new Error('late timeout');}return accepted('newer-receipt');});
 const old=n.deliverEmailForUser('alpha');await entered;at('2026-09-12T00:06:00Z');const newer=await n.deliverEmailForUser('alpha');release();await old;
 assert.equal(newer.sent,1);assert.equal(calls[0].body,calls[1].body);assert.equal(calls[0].headers['Idempotency-Key'],calls[1].headers['Idempotency-Key']);
 const d=h.sql.prepare('SELECT * FROM email_deliveries').get();assert.equal(d.status,'accepted');assert.equal(d.provider_id,'newer-receipt');assert.equal(d.attempts,2);
 assert.equal(h.sql.prepare('SELECT status FROM email_outbox').get().status,'sent');
});

test('receipt storage failure preserves uncertainty and known provider identity instead of a new send',async()=>{
 let calls=0;const {h,n,at}=await fixture(['chatgpt'],'matched',()=>{calls++;return accepted('known-id');});
 assert.ok(h.sql.prepare("SELECT name FROM sqlite_master WHERE name='email_deliveries'").get(),'durable delivery table required');
 h.sql.exec("CREATE TRIGGER fail_receipt BEFORE UPDATE OF status ON email_deliveries WHEN NEW.status='accepted' BEGIN SELECT RAISE(ABORT,'Local receipt failure'); END");
 assert.equal((await n.deliverEmailForUser('alpha')).sent,0);
 const d=h.sql.prepare('SELECT * FROM email_deliveries').get();assert.equal(d.status,'needs_review');assert.equal(d.provider_id,'known-id');
 at('2026-09-13T00:00Z');await n.deliverEmailForUser('alpha');assert.equal(calls,1);
});

test('hide advances the revision so a concurrent settings save cannot erase it',async()=>{
 const {h,n,saved}=await fixture();const record=saved.data.record;
 const pause=pauseRead(h,'SELECT id,payload,updated_at FROM private_records');
 const saving=h.call(h.workspace.POST,{action:'save',kind:'settings',id:record.id,expectedSettingsRevision:record.payload.emailRevision,payload:preferences});
 await pause.entered;const notification=h.sql.prepare('SELECT id FROM notifications').get();
 assert.equal((await h.call(h.notices.POST,{action:'hide',id:notification.id})).status,200);pause.release();
 assert.equal((await saving).status,409);assert.ok(h.record(record.id).hiddenTopics.includes('update:chatgpt'));
 assert.equal(h.sql.prepare('SELECT status FROM email_outbox').get().status,'cancelled');
 assert.equal((await n.deliverEmailForUser('alpha')).sent,0);
});

test('ifAbsent returns existing settings without asking for a mutation revision',async()=>{
 const {h,saved}=await fixture();const r=await h.call(h.workspace.POST,{action:'save',kind:'settings',ifAbsent:true,payload:{...preferences,email:false}});
 assert.equal(r.status,200);assert.equal(r.data.alreadyExists,true);assert.equal(r.data.record.id,saved.data.record.id);assert.equal(r.data.record.payload.email,true);
});

test('consent withdrawal immediately holds attempted retries and preserves the app notice',async()=>{
 const {h,n,saved}=await fixture(['chatgpt'],'matched',()=>new Response('busy',{status:503}));
 await n.deliverEmailForUser('alpha');assert.equal(h.sql.prepare('SELECT status FROM email_deliveries').get().status,'retryable');
 await h.save('settings',{...preferences,email:false},saved.data.record.id);
 assert.equal(h.sql.prepare('SELECT status FROM email_deliveries').get().status,'needs_review');
 assert.equal(h.sql.prepare('SELECT status FROM email_outbox').get().status,'needs_review');
 assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM notifications').get().n,1);
});

test('consent can safely restore never-attempted cancelled candidates while preserving accepted dedup',async()=>{
 const {h,n,saved}=await fixture();await h.save('settings',{...preferences,email:false},saved.data.record.id);
 await h.save('settings',preferences,saved.data.record.id);await n.generateNotifications('alpha');
 assert.equal((await n.deliverEmailForUser('alpha')).sent,1);
 await h.save('settings',{...preferences,email:false},saved.data.record.id);await h.save('settings',{...preferences,emailMode:'matched'},saved.data.record.id);await n.generateNotifications('alpha');
 assert.equal((await n.deliverEmailForUser('alpha')).sent,0);
});

test('a stale generator cannot enqueue email after consent was withdrawn',async()=>{
 const h=harness(),saved=await h.save('settings',preferences),n=h.load('lib/notifications.ts');
 const pause=pauseRead(h,'SELECT id,kind,payload FROM private_records','all'),generating=n.generateNotifications('alpha');
 await pause.entered;await h.save('settings',{...preferences,email:false},saved.data.record.id);pause.release();await generating;
 assert.equal(h.sql.prepare("SELECT COUNT(*) n FROM email_outbox WHERE status='queued'").get().n,0);
});

test('status and exports expose only owned receipt history, and deletion removes every email table',async()=>{
 const {h,n}=await fixture();await n.deliverEmailForUser('alpha');
 h.user({userId:'beta',email:'beta@example.invalid'});await h.save('settings',preferences);await n.generateNotifications('beta');await n.deliverEmailForUser('beta');
 const status=await h.call(h.notices.GET,null,'GET');assert.equal(status.data.email.processing,'on_refresh');assert.equal(status.data.email.recent.length,1);
 const response=await h.call(h.load('app/api/export/route.ts').GET,null,'GET');
 assert.equal(response.data.emailDeliveries.length,1);assert.equal(response.data.emailDeliveries[0].id,status.data.email.recent[0].id);
 assert.doesNotMatch(JSON.stringify(response.data),/claim_token|attempt_token|TEST_ONLY|alpha@example/);
 assert.equal((await h.call(h.workspace.DELETE,{confirmation:'내 기록 삭제'},'DELETE')).status,200);
 for(const table of ['email_deliveries','email_dispatch_state','email_outbox']){
  assert.equal(h.sql.prepare(`SELECT COUNT(*) n FROM ${table} WHERE user_id='beta'`).get().n,0,table);
  assert.equal(h.sql.prepare(`SELECT COUNT(*) n FROM ${table} WHERE user_id='alpha'`).get().n,1,table);
 }
});

test('account deletion during an in-flight request cannot recreate private email records',{timeout:5000},async()=>{
 let enter,release;const entered=new Promise(r=>{enter=r;}),gate=new Promise(r=>{release=r;});
 const {h,n}=await fixture(['chatgpt'],'matched',async()=>{enter();await gate;return accepted('after-delete');});
 const sending=n.deliverEmailForUser('alpha');await entered;await h.call(h.workspace.DELETE,{confirmation:'내 기록 삭제'},'DELETE');release();await sending;
 for(const table of ['private_records','email_deliveries','email_dispatch_state','email_outbox','notifications'])assert.equal(h.sql.prepare(`SELECT COUNT(*) n FROM ${table} WHERE user_id='alpha'`).get().n,0,table);
});

test('a valid late acceptance is retained even when a replacement lease received a failure',{timeout:5000},async()=>{
 let enter,release;const entered=new Promise(r=>{enter=r;}),gate=new Promise(r=>{release=r;});let count=0;
 const {h,n,at}=await fixture(['chatgpt'],'matched',async()=>{count++;if(count===1){enter();await gate;return accepted('known-late-success');}return new Response('busy',{status:503});});
 const old=n.deliverEmailForUser('alpha');await entered;at('2026-09-12T00:06Z');await n.deliverEmailForUser('alpha');release();await old;
 const d=h.sql.prepare('SELECT * FROM email_deliveries').get();assert.equal(d.status,'accepted');assert.equal(d.provider_id,'known-late-success');assert.ok(d.accepted_at);
 assert.equal(h.sql.prepare('SELECT status FROM email_outbox').get().status,'sent');
 at('2026-09-12T00:10Z');await n.deliverEmailForUser('alpha');assert.equal(count,2);
});

test('a stale never-attempted batch replans valid survivors without consuming an empty daily slot',async()=>{
 const {h,n,saved}=await fixture(['chatgpt','claude']);
 const p=pauseRead(h,'SELECT next_digest_not_before FROM email_dispatch_state');
 const sending=n.deliverEmailForUser('alpha');await p.entered;
 // Allow planning, then stop just before the first-attempt CAS to simulate a stopped worker.
 const original=h.env.DB.batch.bind(h.env.DB);let stopped=false;
 h.env.DB.batch=async statements=>{if(!stopped&&h.sql.prepare("SELECT COUNT(*) n FROM email_deliveries WHERE status='prepared'").get().n){stopped=true;throw new Error('Controlled stop before first attempt');}return original(statements);};
 p.release();await assert.rejects(sending,/Controlled stop/);h.env.DB.batch=original;
 assert.equal(h.sql.prepare('SELECT attempts FROM email_deliveries').get().attempts,0);
 await h.save('settings',preferences,saved.data.record.id);assert.equal((await n.deliverEmailForUser('alpha')).sent,1);
 const delivered=h.sql.prepare("SELECT items FROM email_deliveries WHERE status='accepted'").get();assert.equal(JSON.parse(delivered.items).length,1);assert.match(JSON.parse(delivered.items)[0].key,/^update:chatgpt:/);
 assert.notEqual(h.sql.prepare('SELECT last_digest_outcome FROM email_dispatch_state').get().last_digest_outcome,'evaluated_empty');
});

test('a planning transaction failure rolls back the batch, items, and digest consumption',async()=>{
 const {h,n}=await fixture();h.sql.exec("CREATE TRIGGER fail_plan BEFORE UPDATE OF status ON email_outbox WHEN NEW.status='prepared' BEGIN SELECT RAISE(ABORT,'Controlled plan failure'); END");
 await assert.rejects(n.deliverEmailForUser('alpha'),/Controlled plan failure/);
 assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM email_deliveries').get().n,0);assert.equal(h.sql.prepare('SELECT status FROM email_outbox').get().status,'queued');
 assert.equal(h.sql.prepare('SELECT next_digest_not_before FROM email_dispatch_state').get().next_digest_not_before,null);
 h.sql.exec('DROP TRIGGER fail_plan');assert.equal((await n.deliverEmailForUser('alpha')).sent,1);
});

test('known late acceptance survives an acceptance-write failure after lease replacement',{timeout:5000},async()=>{
 let enter,release;const entered=new Promise(r=>{enter=r;}),gate=new Promise(r=>{release=r;});let count=0;
 const {h,n,at}=await fixture(['chatgpt'],'matched',async()=>{count++;if(count===1){enter();await gate;return accepted('known-late-id');}return new Response('busy',{status:503});});
 const old=n.deliverEmailForUser('alpha');await entered;at('2026-09-12T00:06Z');await n.deliverEmailForUser('alpha');
 h.sql.exec("CREATE TRIGGER fail_late_acceptance BEFORE UPDATE OF status ON email_deliveries WHEN NEW.status='accepted' BEGIN SELECT RAISE(ABORT,'Controlled late receipt failure'); END");
 release();await old;const d=h.sql.prepare('SELECT * FROM email_deliveries').get();
 assert.equal(d.status,'needs_review');assert.equal(d.provider_id,'known-late-id');assert.equal(h.sql.prepare('SELECT provider_id FROM email_outbox').get().provider_id,'known-late-id');
 at('2026-09-13T01:00Z');await n.deliverEmailForUser('alpha');assert.equal(count,2);
});
