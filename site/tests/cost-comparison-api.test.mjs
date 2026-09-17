import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';
const base={name:'Scenario QA',amount:20000,currency:'KRW',cycle:'monthly',nextDate:'2026-10-01',anchorDate:'2026-10-01',status:'active',paymentRoute:'web',taxStatus:'included'};
async function setup(){const h=harness(),s=await h.save('subscription',base),sid=s.data.record.id;return {h,sid,endpoint:h.load('app/api/cost-comparisons/route.ts')};}
const conditions={from:'2026-10-01',until:'2026-12-31',switchDate:'2026-10-01',oldBilling:'stop',oldLastChargeDate:null,oldAccess:'ends',oldAccessUntil:'2026-10-31',candidate:{name:'Candidate',amount:30000,currency:'KRW',cycle:'annual',nextDate:'2026-10-01',taxStatus:'included',amountBasis:'total',pricingMode:'fixed'},adjustments:[],extrasConfirmed:true,quoteSource:'Quote QA',quoteCheckedAt:'2026-09-12',criteria:{keepFit:'yes',changeFit:'yes',eligibility:'yes',changeWilling:'yes',budgets:{KRW:100000}}};
const body=async(h,sid)=>({action:'save',subscriptionId:sid,...await h.guard('subscription',{},sid),title:'October transition',conditions,decision:'consider',reason:'Cost and capacity',outcome:''});
const financial=h=>JSON.stringify(h.sql.prepare("SELECT * FROM private_records WHERE kind!='costComparison' ORDER BY id").all());
test('comparison save computes owned snapshot and leaves every financial record byte-identical',async()=>{
 const {h,sid,endpoint}=await setup(),before=financial(h),r=await h.call(endpoint.POST,{...await body(h,sid),result:{cheaper:'forged'}});assert.equal(r.status,200);assert.equal(r.data.record.kind,'costComparison');assert.equal(r.data.record.payload.result.change.total.KRW,30000);assert.equal(r.data.record.payload.result.cheaper,'change');assert.equal(financial(h),before);
 assert.equal((await h.call(h.workspace.POST,{action:'save',kind:'costComparison',payload:{result:{cheaper:'forged'}}})).status,400);
 const list=await h.call(h.workspace.GET,null,'GET');assert.ok(list.data.records.some(r=>r.kind==='costComparison'));
});
test('stale source revision, ABA history id and foreign subscription cannot create a snapshot',async()=>{
 const {h,sid,endpoint}=await setup(),b=await body(h,sid);await h.save('payment',{subscriptionId:sid,date:'2026-09-12',amount:1,currency:'KRW'});
 assert.equal((await h.call(endpoint.POST,b)).status,409);assert.equal((await h.call(endpoint.POST,{...await body(h,sid),historyId:'wrong'})).status,409);
 h.user({userId:'beta'});assert.equal((await h.call(endpoint.POST,b)).status,404);assert.equal(h.sql.prepare("SELECT COUNT(*) n FROM private_records WHERE kind='costComparison'").get().n,0);
});
test('annotation preserves captured cost; later source edits do not rewrite saved result',async()=>{
 const {h,sid,endpoint}=await setup(),r=await h.call(endpoint.POST,await body(h,sid)),cid=r.data.record.id,snapshot=JSON.stringify(r.data.record.payload.source),result=JSON.stringify(r.data.record.payload.result);
 await h.terms(sid,{action:'append',effectiveFrom:'2026-10-01',reason:'Changed price',terms:{...base,amount:90000}});
 const a=await h.call(endpoint.POST,{action:'annotate',id:cid,decision:'defer',reason:'Check export',outcome:'No change yet'});assert.equal(a.status,200);assert.equal(JSON.stringify(a.data.record.payload.source),snapshot);assert.equal(JSON.stringify(a.data.record.payload.result),result);assert.equal(a.data.record.payload.decision,'defer');
 const fresh=await h.call(endpoint.POST,await body(h,sid));assert.equal(fresh.data.record.payload.result.keep.total.KRW,270000);
});
test('owner isolation, export, scenario-only deletion and account erasure include snapshots',async()=>{
 const {h,sid,endpoint}=await setup(),r=await h.call(endpoint.POST,await body(h,sid)),cid=r.data.record.id,before=financial(h);
 h.user({userId:'beta'});assert.equal((await h.call(endpoint.POST,{action:'delete',id:cid})).status,404);assert.equal((await h.call(endpoint.POST,{action:'annotate',id:cid,decision:'change',reason:'',outcome:''})).status,404);assert.equal((await h.call(h.workspace.GET,null,'GET')).data.records.length,0);
 h.user({userId:'alpha'});const exported=await h.call(h.load('app/api/export/route.ts').GET,null,'GET');assert.ok(JSON.stringify(exported.data).includes('October transition'));
 assert.equal((await h.call(endpoint.POST,{action:'delete',id:cid})).status,200);assert.equal(financial(h),before);
 await h.call(endpoint.POST,await body(h,sid));await h.call(h.workspace.DELETE,{confirmation:'내 기록 삭제'},'DELETE');assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM private_records').get().n,0);
});
test('foreign refund links and invalid date ranges fail without storing a comparison',async()=>{
 const {h,sid,endpoint}=await setup();for(const patch of [{until:'2026-09-01'},{adjustments:[{id:'a',type:'refund',scenario:'change',date:'2026-10-01',amount:1,currency:'KRW',confirmed:true,source:'quote',recordedPaymentId:'foreign'}]}])assert.equal((await h.call(endpoint.POST,{...await body(h,sid),conditions:{...conditions,...patch}})).status,400);
 assert.equal(h.sql.prepare("SELECT COUNT(*) n FROM private_records WHERE kind='costComparison'").get().n,0);
});
test('a source mutation after calculation but before insert rejects the entire snapshot',async()=>{
 const {h,sid,endpoint}=await setup(),b=await body(h,sid),original=h.env.DB.prepare.bind(h.env.DB);let injected=false;
 h.env.DB.prepare=q=>{const statement=original(q);if(q.startsWith('INSERT INTO private_records')&&q.includes("'costComparison'")){const bind=statement.bind;statement.bind=(...params)=>{const bound=bind(...params),run=bound.run.bind(bound);bound.run=async()=>{injected=true;h.sql.prepare("UPDATE private_records SET payload=json_set(payload,'$.revision',json_extract(payload,'$.revision')+1) WHERE kind='billing_terms'").run();return run();};return bound;};}return statement;};
 assert.equal((await h.call(endpoint.POST,b)).status,409);assert.equal(injected,true);assert.equal(h.sql.prepare("SELECT COUNT(*) n FROM private_records WHERE kind='costComparison'").get().n,0);
});
test('unauthenticated and cross-origin requests cannot save or delete private scenarios',async()=>{
 const {h,sid,endpoint}=await setup(),b=await body(h,sid);assert.equal((await h.call(endpoint.POST,b,'POST',{Origin:'https://unrelated.invalid'})).status,403);h.user(null);assert.equal((await h.call(endpoint.POST,b)).status,401);
});
