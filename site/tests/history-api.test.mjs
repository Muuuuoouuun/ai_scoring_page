import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';
const base={name:'History QA',plan:'Monthly',amount:30000,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',anchorDate:'2026-09-15',status:'active',paymentRoute:'web',taxStatus:'included',personalShare:10000};
const proposal=(patch={})=>({action:'append',effectiveFrom:'2026-10-01',reason:'Confirmed October terms',terms:{...base,...patch}});
test('new contracts have an observed baseline and private, server-owned history',async()=>{
 const h=harness(),r=await h.save('subscription',base);assert.equal(r.status,200);
 const get=await h.call(h.workspace.GET,null,'GET'),p=get.data.records[0].payload;
 assert.equal(p.termsHistory.schemaVersion,1);assert.equal(p.termsHistory.revision,1);assert.equal(p.termsHistory.versions[0].basis,'observed');
 assert.equal(p.termsHistory.knownFrom,h.load('lib/billing.ts').today());assert.equal(get.data.records.length,1);
 assert.equal((await h.call(h.workspace.POST,{action:'save',kind:'billing_terms',payload:{}})).status,400);
 h.user({userId:'beta'});assert.equal((await h.call(h.workspace.GET,null,'GET')).data.records.length,0);assert.equal((await h.terms(r.data.record.id,proposal())).status,404);
});
test('dated currency and cycle changes preserve earlier paid invoice snapshots and edits',async()=>{
 const h=harness(undefined,{now:()=>"2026-09-15T12:00:00.000Z"}),s=await h.save('subscription',base),sid=s.data.record.id;
 const paid=await h.save('payment',{subscriptionId:sid,date:'2026-09-16',plannedDate:'2026-09-15',amount:29000,currency:'KRW',personalAmount:7000,personalCurrency:'KRW'});assert.equal(paid.status,200);
 const old=paid.data.record.payload,change=await h.terms(sid,proposal({currency:'USD',amount:20000,cycle:'annual',nextDate:'2026-10-20',anchorDate:'2026-10-20',personalShare:4000}));assert.equal(change.status,200);
 const edited=await h.save('payment',{...old,note:'Bank checked'},paid.data.record.id);assert.equal(edited.status,200);
 for(const k of ['plannedKey','plannedAmount','plannedCurrency','plannedVersionId','plannedPersonalAmount'])assert.equal(edited.data.record.payload[k],old[k]);
 const records=(await h.call(h.workspace.GET,null,'GET')).data.records,c=records.find(r=>r.id===sid),report=h.load('lib/billing.ts').billingReport([{id:sid,...c.payload}],[{id:paid.data.record.id,...edited.data.record.payload}],'2026-09-01','2026-11-30','2026-09-12');
 assert.deepEqual(JSON.parse(JSON.stringify(report.remaining)),{USD:20000});assert.equal(report.personalActual.KRW,7000);
});
test('stale bundle changes and cancellation records leave every row byte-identical',async()=>{
 const h=harness(),a=await h.save('subscription',{...base,bundleId:'suite'}),b=await h.save('subscription',{...base,name:'Peer',bundleId:'suite'}),g=await h.guard('subscription',{},a.data.record.id);
 assert.equal((await h.terms(a.data.record.id,proposal(),g)).status,200);
 const before=JSON.stringify(h.sql.prepare('SELECT * FROM private_records ORDER BY id').all());
 assert.equal((await h.terms(b.data.record.id,proposal({amount:99000}),g)).status,409);
 assert.equal((await h.call(h.workspace.POST,{action:'save',kind:'cancellation',payload:{subscriptionId:b.data.record.id,stage:'confirmed',paymentRoute:'web',remainingPayments:0},...g})).status,409);
 assert.equal(JSON.stringify(h.sql.prepare('SELECT * FROM private_records ORDER BY id').all()),before);
});
test('same-revision requests race to one complete shared result',async()=>{
 const h=harness(),a=await h.save('subscription',{...base,bundleId:'race'}),b=await h.save('subscription',{...base,bundleId:'race'}),g=await h.guard('subscription',{},a.data.record.id);
 const r=await Promise.all([h.terms(a.data.record.id,proposal({amount:40000}),g),h.terms(b.data.record.id,proposal({amount:50000}),g)]);assert.deepEqual(r.map(r=>r.status).sort(),[200,409]);
 const data=(await h.call(h.workspace.GET,null,'GET')).data.records;assert.deepEqual(data[0].payload.termsHistory,data[1].payload.termsHistory);assert.equal(data[0].payload.termsHistory.versions.length,2);
});
test('corrections append, unknown-date proposals remain pending, and future changes can be voided',async()=>{
 const h=harness(),a=await h.save('subscription',base),sid=a.data.record.id;
 const change=await h.terms(sid,proposal({amount:50000}));assert.equal(change.status,200);const wrong=change.data.history.versions.at(-1).id;
 const corrected=await h.terms(sid,{...proposal({amount:35000}),action:'correct',supersedes:wrong});assert.equal(corrected.status,200);assert.equal(corrected.data.history.versions.length,3);
 const pending=await h.terms(sid,{...proposal({amount:36000}),effectiveFrom:null,alreadyChanged:true});assert.equal(pending.status,200);assert.equal(pending.data.history.versions.at(-1).state,'draft');
 const voided=await h.terms(sid,{action:'void',supersedes:corrected.data.history.versions.at(-1).id,reason:'Future renewal withdrawn'});assert.equal(voided.status,200);
 assert.equal(voided.data.history.versions.at(-1).state,'void');
});
test('term histories are exported and erased with their account; stale edits cannot recreate them',async()=>{
 const h=harness(),a=await h.save('subscription',base),sid=a.data.record.id,g=await h.guard('subscription',{},sid);
 assert.equal((await h.terms(sid,proposal())).status,200);
 const exported=await h.call(h.load('app/api/export/route.ts').GET,null,'GET');assert.ok(JSON.stringify(exported.data).includes('billing_terms'));assert.ok(JSON.stringify(exported.data).includes('Confirmed October terms'));
 await h.call(h.workspace.DELETE,{confirmation:'내 기록 삭제'},'DELETE');assert.equal((await h.terms(sid,proposal(),g)).status,404);assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM private_records').get().n,0);
});
test('actual personal amounts preserve unknown and zero, and refund bounds are enforced',async()=>{
 const h=harness(),s=await h.save('subscription',base),sid=s.data.record.id,p={subscriptionId:sid,date:'2026-09-16',amount:30000,currency:'KRW'};
 const unknown=await h.save('payment',p);assert.equal(unknown.status,200);assert.equal(unknown.data.record.payload.personalAmount,null);
 assert.equal((await h.save('payment',{...p,personalAmount:31000,personalCurrency:'KRW'})).status,400);
 const charge=await h.save('payment',{...p,personalAmount:7000,personalCurrency:'KRW'});assert.equal(charge.status,200);
 const refund={...p,entryType:'refund',refundOfId:charge.data.record.id,amount:10000,personalAmount:5000,personalCurrency:'KRW'};
 assert.equal((await h.save('payment',refund)).status,200);assert.equal((await h.save('payment',{...refund,personalAmount:3000})).status,400);
 assert.equal((await h.save('payment',{...p,personalAmount:0,personalCurrency:'KRW'})).data.record.payload.personalAmount,0);
 assert.equal((await h.save('payment',{...p,personalAmount:4000,personalCurrency:'KRW'},charge.data.record.id)).status,400);
});
test('correcting an unresolved correction replaces its original confirmed condition',async()=>{
 const h=harness(),a=await h.save('subscription',base),sid=a.data.record.id;
 const change=await h.terms(sid,proposal({amount:50000})),wrong=change.data.history.versions.at(-1).id;
 const draft=await h.terms(sid,{...proposal(),action:'correct',supersedes:wrong,effectiveFrom:null,alreadyChanged:true});
 const revised=await h.terms(sid,{...proposal({amount:36000}),action:'correct',supersedes:draft.data.history.versions.at(-1).id,effectiveFrom:null,alreadyChanged:false});
 assert.equal(revised.status,200);assert.equal(h.load('lib/billing.ts').pendingTerms(revised.data.history).length,1);
 const confirmed=await h.terms(sid,{...proposal({amount:35000}),action:'correct',supersedes:revised.data.history.versions.at(-1).id,effectiveFrom:'2026-10-02'});
 assert.equal(confirmed.status,200);const active=h.load('lib/billing.ts').activeTerms(confirmed.data.history);assert.equal(active.some(v=>v.id===wrong),false);assert.equal(active.length,2);
});
test('a failed database statement rolls back member writes and the shared history',async()=>{
 const h=harness(),a=await h.save('subscription',{...base,bundleId:'atomic'}),b=await h.save('subscription',{...base,bundleId:'atomic'}),sid=a.data.record.id;
 const before=JSON.stringify(h.sql.prepare('SELECT * FROM private_records ORDER BY id').all());
 h.sql.exec("CREATE TRIGGER reject_history_update BEFORE UPDATE ON private_records WHEN NEW.kind='billing_terms' BEGIN SELECT RAISE(ABORT,'Injected rollback check'); END");
 assert.equal((await h.terms(sid,proposal())).status,503);assert.equal(JSON.stringify(h.sql.prepare('SELECT * FROM private_records ORDER BY id').all()),before);
});
test('deleting the last unreferenced member removes its history and allows a new bundle incarnation',async()=>{
 const h=harness(),a=await h.save('subscription',{...base,bundleId:'reusable'}),sid=a.data.record.id,g=await h.guard('subscription',{},sid);
 assert.equal((await h.call(h.workspace.POST,{action:'delete',kind:'subscription',id:sid,...g})).status,200);
 assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM private_records').get().n,0);
 const b=await h.save('subscription',{...base,bundleId:'reusable'});assert.equal(b.status,200);const fresh=await h.guard('subscription',{},b.data.record.id);assert.notEqual(fresh.historyId,g.historyId);
 assert.equal((await h.terms(b.data.record.id,proposal(),g)).status,409);
});
test('legacy initialization cannot resurrect an already-deleted parent or orphan its payment',async()=>{
 const h=harness(),a=await h.save('subscription',base),sid=a.data.record.id;
 h.sql.prepare("DELETE FROM private_records WHERE kind='billing_terms'").run();
 const batch=h.env.DB.batch;h.env.DB.batch=async statements=>{h.sql.prepare("DELETE FROM private_records WHERE user_id='alpha'").run();return batch(statements);};
 const p=await h.save('payment',{subscriptionId:sid,date:'2026-09-15',amount:30000,currency:'KRW'});assert.equal(p.status,409);assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM private_records').get().n,0);
});
test('personal refunds use the recorded personal charge currency',async()=>{
 const h=harness(),a=await h.save('subscription',base),sid=a.data.record.id,p={subscriptionId:sid,date:'2026-09-16',amount:30000,currency:'KRW',personalAmount:7000,personalCurrency:'KRW'},charge=await h.save('payment',p);
 assert.equal((await h.save('payment',{...p,entryType:'refund',refundOfId:charge.data.record.id,amount:10000,personalAmount:100,personalCurrency:'EUR'})).status,400);
});
test('confirmed cancellation carries through reserved future price changes without reviving billing',async()=>{
 const h=harness(),a=await h.save('subscription',base),sid=a.data.record.id;
 assert.equal((await h.terms(sid,proposal({amount:50000}))).status,200);
 const cancel=await h.save('cancellation',{subscriptionId:sid,stage:'confirmed',paymentRoute:'web',remainingPayments:0,endDate:'2026-09-12'});assert.equal(cancel.status,200);
 const r=(await h.call(h.workspace.GET,null,'GET')).data.records.find(r=>r.id===sid),summary=h.load('lib/billing.ts').summarizeContracts([{id:sid,...r.payload}],'2026-09-12','2026-12-31');assert.equal(summary.schedule.length,0);
});
test('a cancellation note edit cannot silently move a previously applied confirmation date',async()=>{
 const h=harness(),a=await h.save('subscription',base),sid=a.data.record.id;const first=a.data.record.payload.termsHistory.versions[0];await h.terms(sid,{action:'correct',supersedes:first.id,effectiveFrom:'2026-09-01',terms:base,reason:'Known start'});const c=await h.save('cancellation',{subscriptionId:sid,stage:'confirmed',paymentRoute:'web',confirmedAt:'2026-09-12'});
 assert.equal(c.status,200);assert.equal((await h.save('cancellation',{...c.data.record.payload,confirmedAt:'2026-09-11'},c.data.record.id)).status,409);
});
test('backdated cancellation cannot overwrite a later already-effective contract decision',async()=>{
 const h=harness(),a=await h.save('subscription',base),sid=a.data.record.id,first=a.data.record.payload.termsHistory.versions[0];
 await h.terms(sid,{action:'correct',supersedes:first.id,effectiveFrom:'2026-09-01',reason:'Known baseline',terms:base});
 await h.terms(sid,{...proposal(),effectiveFrom:'2026-09-10'});
 const before=JSON.stringify(h.sql.prepare('SELECT * FROM private_records ORDER BY id').all());
 assert.equal((await h.save('cancellation',{subscriptionId:sid,stage:'confirmed',paymentRoute:'web',confirmedAt:'2026-09-05',remainingPayments:0})).status,409);assert.equal(JSON.stringify(h.sql.prepare('SELECT * FROM private_records ORDER BY id').all()),before);
});
test('filling an unknown personal charge cannot conflict with an already recorded refund currency',async()=>{
 const h=harness(),a=await h.save('subscription',base),sid=a.data.record.id,p={subscriptionId:sid,date:'2026-09-16',amount:30000,currency:'KRW'},charge=await h.save('payment',p);
 assert.equal((await h.save('payment',{...p,entryType:'refund',refundOfId:charge.data.record.id,amount:10000,personalAmount:100,personalCurrency:'EUR'})).status,200);
 assert.equal((await h.save('payment',{...p,personalAmount:7000,personalCurrency:'KRW'},charge.data.record.id)).status,400);
});
test('legacy current conditions are recorded with unknown earlier dates before explicit corrections',async()=>{
 const h=harness(),a=await h.save('subscription',base),sid=a.data.record.id;h.sql.prepare("DELETE FROM private_records WHERE kind='billing_terms'").run();
 const r=await h.terms(sid,{action:'initialize',reason:'Record current conditions'});assert.equal(r.status,200);assert.equal(r.data.history.versions[0].basis,'observed');assert.equal(r.data.history.legacySnapshot.amount,30000);
});
