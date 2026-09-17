import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {harness} from './api-harness.mjs';
const root=new URL('..',import.meta.url).pathname;
const sources=JSON.parse(fs.readFileSync(root+'data/promotions.json','utf8'));
const catalogSource=JSON.parse(fs.readFileSync(root+'data/catalog.json','utf8'));
async function fixture(extra={},respond=null) {
 let clock='2026-09-12T10:00:00Z';const requests=[];
 const p={...structuredClone(sources[0]),id:'audit-offer',revision:1,status:'active',reviewStatus:'verified',expiresAt:'2026-12-31',expiresInstant:null,expiresTimeZone:null,price:{amount:0,currency:'USD',period:'month',tax:'included'},renewalPrice:{amount:20,currency:'USD',period:'month',tax:'included'},benefitMonths:12,offerFeatures:[{id:'document-analysis',status:'supported',condition:'',sourceUrl:'https://example.invalid/docs'}]};
 const promotions=[p],catalog=structuredClone(catalogSource);
 const h=harness(async (url,o)=>{assert.equal(url,'https://api.resend.com/emails');requests.push({key:o.headers['Idempotency-Key'],body:JSON.parse(o.body)});return respond?respond(requests.at(-1),requests.length):Response.json({id:'mock-'+requests.length});},{now:()=>clock,jsonFixtures:{'data/promotions.json':promotions,'data/catalog.json':catalog}});
 const n=h.load('lib/notifications.ts'),facts=h.load('lib/promotion-facts.ts');
 const settings={interests:['gemini'],includeAlternatives:false,inApp:true,email:true,emailMode:'matched',emailTimeZone:'UTC',emailTime:'00:00',promotionEligibility:{[p.id]:'eligible'},promotionEligibilityVersions:{[p.id]:facts.eligibilityFingerprint(p)},...extra};
 const save=await h.save('settings',settings);assert.equal(save.status,200,JSON.stringify(save));
 return {h,n,p,promotions,settings,requests,clock:v=>clock=v,offer:()=>requests.filter(x=>x.body.text.includes(p.name)),async run(){await n.generateNotifications('alpha');return n.deliverEmailForUser('alpha');},async cards(){const r=await h.call(h.notices.GET,null,'GET');assert.equal(r.status,200,JSON.stringify(r));return r.data.notifications.filter(x=>x.card_key==='promotion:audit-offer');}};
}
test('AUDIT A-B-A new material revision is not suppressed as already sent A',async()=>{
 const f=await fixture();await f.run();f.p.price.amount=5;f.p.revision=2;f.clock('2026-09-12T11:00:00Z');await f.run();f.p.price.amount=0;f.p.revision=3;f.clock('2026-09-12T12:00:00Z');await f.run();
 const out={requests:f.offer().length,versionRows:f.h.sql.prepare("SELECT source_key,metadata FROM notifications WHERE source_key LIKE 'promotion:audit-offer:%'").all(),card:f.h.sql.prepare("SELECT source_version,source_revision FROM notification_cards WHERE card_key='promotion:audit-offer'").get()};console.log('ABA',JSON.stringify(out));assert.equal(f.offer().length,3);
});
test('AUDIT irrelevant feature edit does not generate a fresh promotional email',async()=>{
 const f=await fixture({neededFeatures:['document-analysis']});await f.run();f.p.offerFeatures.push({id:'live-conversation',status:'supported',condition:'',sourceUrl:'https://example.invalid/live'});f.p.revision++;f.clock('2026-09-12T11:00:00Z');await f.run();console.log('IRRELEVANT',JSON.stringify({requests:f.offer().length,title:(await f.cards())[0].title}));assert.equal(f.offer().length,1);
});
test('AUDIT old-worker GET does not overwrite current stored card with stale price',async()=>{
 const f=await fixture();await f.run();f.p.price.amount=5;f.p.revision=2;f.clock('2026-09-12T11:00:00Z');await f.run();const fresh=(await f.cards())[0];f.p.price.amount=0;f.p.revision=1;const stale=(await f.cards())[0];console.log('STALEGET',JSON.stringify({fresh:fresh.body,stale:stale.body,head:f.h.sql.prepare("SELECT * FROM notice_source_heads WHERE card_key='promotion:audit-offer'").get(),storedSourceKey:stale.source_key}));assert.equal(stale.body,fresh.body);
});
test('AUDIT withdrawal remains reviewable after interest removal',async()=>{
 const f=await fixture();await f.run();f.p.status='withdrawn';f.p.revision++;await f.run();const before=await f.cards();await f.h.save('settings',{...f.settings,interests:[],email:false});const after=await f.cards();console.log('RETAINED',JSON.stringify({before:before.length,after:after.length,stored:f.h.sql.prepare("SELECT status FROM notification_cards WHERE card_key='promotion:audit-offer'").get()}));assert.equal(after.length,1);
});
test('AUDIT account deletion removes cards and export is isolated',async()=>{
 const f=await fixture();await f.run();f.h.user({userId:'beta',email:'beta@example.invalid',fullName:'Beta'});assert.equal((await f.cards()).length,0);f.h.user({userId:'alpha',email:'alpha@example.invalid',fullName:'Alpha'});const r=await f.h.call(f.h.workspace.DELETE,{confirmation:'내 기록 삭제'},'DELETE');assert.equal(r.status,200);assert.equal(f.h.sql.prepare('SELECT COUNT(*) n FROM notification_cards WHERE user_id=?').get('alpha').n,0);assert.equal((await f.cards()).length,0);
});

test('AUDIT an existing pre-deadline correction retry does not send its stale open-offer text after expiry',async()=>{
 let correctionCalls=0;
 const f=await fixture({},(request,n)=>request.body.text.includes('정정 · ')?(++correctionCalls===1?new Response('',{status:503}):Response.json({id:'mock-'+n})):Response.json({id:'mock-'+n}));
 f.p.expiresAt='2026-09-12';f.p.expiresInstant='2026-09-12T10:02:00Z';await f.run();
 f.p.price.amount=5;f.p.revision++;f.clock('2026-09-12T10:00:30Z');await f.run();assert.equal(correctionCalls,1);
 f.clock('2026-09-12T10:02:00Z');await f.run();
 console.log('CORRECTION_EXPIRY',JSON.stringify({correctionCalls,requests:f.offer().map(x=>({key:x.key,text:x.body.text})),rows:f.h.sql.prepare("SELECT status,attempts FROM email_deliveries").all()}));
 assert.equal(correctionCalls,1);
});
test('AUDIT missing one current card stops the entire immutable batch before attempts',async()=>{
 const f=await fixture();await f.n.generateNotifications('alpha');f.h.sql.exec("CREATE TRIGGER hold_first BEFORE UPDATE OF status ON email_deliveries WHEN NEW.status='sending' BEGIN SELECT RAISE(IGNORE); END");await f.n.deliverEmailForUser('alpha');f.h.sql.exec('DROP TRIGGER hold_first');f.h.sql.prepare("DELETE FROM notification_cards WHERE card_key='promotion:audit-offer'").run();await f.n.deliverEmailForUser('alpha');assert.equal(f.requests.length,0);assert.equal(f.h.sql.prepare('SELECT MAX(attempts) n FROM email_deliveries').get().n,0);assert.equal(f.h.sql.prepare('SELECT MAX(attempts) n FROM email_outbox').get().n,0);
});
test('AUDIT private billing never creates global source heads and delete leaves none',async()=>{
 const f=await fixture();const subscription=await f.h.save('subscription',{name:'Private bill',amount:10000,currency:'KRW',cycle:'monthly',anchorDate:'2026-09-15',nextDate:'2026-09-15',status:'active',paymentRoute:'web'});assert.equal(subscription.status,200,JSON.stringify(subscription));const id=subscription.data.record.id;await f.n.generateNotifications('alpha');const before=f.h.sql.prepare("SELECT * FROM notice_source_heads WHERE card_key LIKE ?").all('billing:'+id+':%');assert.equal(before.length,0,'Private billing must not enter shared source registry');await f.h.call(f.h.workspace.DELETE,{confirmation:'내 기록 삭제'},'DELETE');const after=f.h.sql.prepare("SELECT * FROM notice_source_heads WHERE card_key LIKE ?").all('billing:'+id+':%');console.log('BILLING_DELETE',JSON.stringify({before,after}));assert.equal(after.length,0);
});
