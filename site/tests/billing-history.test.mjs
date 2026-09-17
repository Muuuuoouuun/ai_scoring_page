import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeContracts,billingReport,contractAmount} from '../lib/billing.ts';
import * as billing from '../lib/billing.ts';
const base={plan:'Monthly',amount:30000,currency:'KRW',cycle:'monthly',anchorDate:'2026-09-15',nextDate:'2026-09-15',status:'active',amountBasis:'total',taxStatus:'included',personalShare:10000,remainingPayments:null,remainingFromDate:'2026-09-15'};
const version=(id,effectiveFrom,terms={},extra={})=>({id,effectiveFrom,recordedAt:'2026-09-12T09:00:00Z',state:'confirmed',terms:{...base,...terms},reason:'Known contract terms',...extra});
const contract=(versions,extra={})=>({id:'contract-a',...base,...extra,termsHistory:{schemaVersion:1,revision:versions.length,knownFrom:'2026-09-01',versions}});

test('dated conditions apply only on or after their effective date, including seats and tax',()=>{
 const c=contract([version('v1','2026-09-01'),version('v2','2026-10-10',{amount:12000,amountBasis:'perSeat',seats:3,taxStatus:'excluded',taxAmount:3600,personalShare:13200})]);
 const r=summarizeContracts([c],'2026-09-01','2026-11-30');
 assert.deepEqual(r.schedule.map(d=>[d.date,d.amount,d.personalShare,d.versionId]),[['2026-09-15',30000,10000,'v1'],['2026-10-15',39600,13200,'v2'],['2026-11-15',39600,13200,'v2']]);
 assert.equal(r.currencies.KRW.monthly,30000);assert.equal(r.currencies.KRW.expected,109200);
 assert.equal(contractAmount(c,'2026-10-09'),30000);assert.equal(contractAmount(c,'2026-10-10'),39600);
});
test('querying before known history does not backfill past prices, while actual payments remain',()=>{
 const c=contract([version('v1','2026-09-01')]);
 const r=billingReport([c],[{id:'old',subscriptionId:c.id,date:'2026-08-15',amount:18000,currency:'KRW'}],'2026-08-01','2026-09-30','2026-09-12');
 assert.equal(contractAmount(c,'2026-08-15'),null);assert.equal(r.summary.unknownHistory,1);
 assert.deepEqual(r.schedule.map(d=>d.date),['2026-09-15']);assert.equal(r.actual.KRW,18000);
});
test('future currency conditions preserve old currency bills and current monthly amount',()=>{
 const c=contract([version('v1','2026-09-01',{amount:2000,currency:'USD',personalShare:500}),version('v2','2026-10-01',{amount:30000,currency:'KRW',personalShare:10000})]);
 const r=summarizeContracts([c],'2026-09-01','2026-10-31');
 assert.equal(r.currencies.USD.monthly,2000);assert.equal(r.currencies.USD.expected,2000);assert.equal(r.currencies.KRW.expected,30000);
 assert.deepEqual(r.schedule.map(d=>d.currency),['USD','KRW']);
});
test('a confirmed cycle change replaces the old schedule after the effective date',()=>{
 const c=contract([version('v1','2026-09-01'),version('v2','2026-10-10',{amount:300000,cycle:'annual',anchorDate:'2026-10-20',nextDate:'2026-10-20'})]);
 const r=summarizeContracts([c],'2026-09-01','2027-10-31');
 assert.deepEqual(r.schedule.map(d=>[d.date,d.amount]),[['2026-09-15',30000],['2026-10-20',300000],['2027-10-20',300000]]);
});
test('price-only changes neither invent mid-cycle annual bills nor restart remaining N',()=>{
 const annual=contract([version('v1','2026-09-01',{amount:300000,cycle:'annual'}),version('v2','2026-10-10',{amount:360000,cycle:'annual'})]);
 assert.deepEqual(summarizeContracts([annual],'2026-09-01','2027-09-30').schedule.map(d=>[d.date,d.amount]),[['2026-09-15',300000],['2027-09-15',360000]]);
 const stopped=contract([version('v1','2026-09-01',{status:'cancelled',remainingPayments:2}),version('v2','2026-10-01',{status:'cancelled',remainingPayments:2,amount:35000})]);
 assert.deepEqual(summarizeContracts([stopped],'2026-09-01','2027-01-31').schedule.map(d=>[d.date,d.amount]),[['2026-09-15',30000],['2026-10-15',35000]]);
 assert.deepEqual(summarizeContracts([stopped],'2026-11-01','2027-01-31').schedule,[]);
});
test('dated pause and resume preserve old invoices and suppress only applicable future bills',()=>{
 const c=contract([version('v1','2026-09-01'),version('v2','2026-10-01',{status:'paused',pauseBilling:'stops',resumeDate:'2026-12-01'})]);
 assert.deepEqual(summarizeContracts([c],'2026-09-01','2026-12-31').schedule.map(d=>d.date),['2026-09-15','2026-12-15']);
});
test('unknown-date change is retained but never silently applied as confirmed',()=>{
 const c=contract([version('v1','2026-09-01'),version('draft',null,{amount:100},{state:'draft'})]);
 const r=summarizeContracts([c],'2026-09-01','2026-10-31');
 assert.equal(r.pendingTerms,1);assert.equal(r.currencies.KRW.expected,60000);assert.equal(contractAmount(c,'2026-10-15'),30000);
});
test('a superseding correction keeps old version audit entries but does not duplicate bills',()=>{
 const c=contract([version('v1','2026-09-01'),version('wrong','2026-10-01',{amount:50000}),version('fixed','2026-10-01',{amount:35000},{supersedes:'wrong'})]);
 const r=summarizeContracts([c],'2026-09-01','2026-10-31');assert.deepEqual(r.schedule.map(d=>d.amount),[30000,35000]);assert.equal(c.termsHistory.versions.length,3);
});
test('incompatible shared histories are flagged instead of picking one bundle member',()=>{
 const a=contract([version('v1','2026-09-01')],{bundleId:'suite'}),b=contract([version('other','2026-09-01',{amount:50000})],{id:'b',bundleId:'suite'});
 const r=summarizeContracts([a,b],'2026-09-01','2026-09-30');assert.equal(r.conflictingHistory,1);assert.deepEqual(r.schedule,[]);
});
test('dated history is deduplicated for consistent bundle members',()=>{
 const a=contract([version('v1','2026-09-01')],{bundleId:'suite'}),b={...a,id:'b'};
 assert.equal(summarizeContracts([b,a],'2026-09-01','2026-09-30').currencies.KRW.expected,30000);
});
test('actual personal expenses use their own dates and currencies, not current contract share',()=>{
 const c=contract([version('v1','2026-09-01'),version('v2','2026-10-01',{personalShare:15000})]);
 const payments=[{id:'p',subscriptionId:c.id,date:'2026-09-16',plannedDate:'2026-09-15',plannedKey:'contract:contract-a@2026-09-15',amount:29000,currency:'KRW',personalAmount:7000,personalCurrency:'KRW'}, {id:'r',subscriptionId:c.id,refundOfId:'p',entryType:'refund',date:'2026-10-02',amount:1000,currency:'KRW',personalAmount:1000,personalCurrency:'KRW'}];
 const r=billingReport([c],payments,'2026-09-01','2026-10-31','2026-09-12');
 assert.equal(r.personalActual.KRW,6000);assert.equal(r.personalRemaining.KRW,15000);assert.equal(r.personalForecast.KRW,21000);
 assert.equal(billingReport([c],payments,'2026-10-01','2026-10-31','2026-10-01').personalActual.KRW,-1000);
});
test('matched unknown personal actual never reopens a planned personal bill; explicit zero stays known',()=>{
 const c=contract([version('v1','2026-09-01')]);
 const payment={id:'p',subscriptionId:c.id,date:'2026-09-16',plannedDate:'2026-09-15',amount:30000,currency:'KRW',personalAmount:null,personalCurrency:null};
 const r=billingReport([c],[payment],'2026-09-01','2026-09-30','2026-09-12');
 assert.equal(r.unknownPersonalActual,1);assert.equal(r.personalRemaining.KRW,undefined);assert.equal(r.personalForecast.KRW,undefined);
 const known=billingReport([c],[{...payment,personalAmount:0,personalCurrency:'KRW'}],'2026-09-01','2026-09-30','2026-09-12');
 assert.equal(known.unknownPersonalActual,0);assert.equal(known.personalActual.KRW,0);
});
test('matching snapshot survives corrected conditions and removed historical schedule occurrence',()=>{
 const c=contract([version('v1','2026-09-01'),version('v2','2026-10-01',{cycle:'annual',anchorDate:'2026-10-20',nextDate:'2026-10-20',amount:300000})]);
 const p={id:'p',subscriptionId:c.id,date:'2026-10-16',plannedDate:'2026-10-15',plannedKey:'contract:contract-a@2026-10-15',plannedAmount:30000,plannedCurrency:'KRW',plannedPersonalAmount:10000,plannedVersionId:'old-v',amount:29000,currency:'KRW',personalAmount:9000,personalCurrency:'KRW'};
 const r=billingReport([c],[p],'2026-10-01','2026-10-31','2026-09-12');
 const historical=r.schedule.find(d=>d.key===p.plannedKey);assert.ok(historical);assert.equal(historical.state,'confirmed');assert.equal(historical.difference,-1000);assert.equal(historical.versionId,'old-v');assert.equal(r.actual.KRW,29000);
});
test('aggregate integer overflow is rejected rather than producing a rounded money total',()=>{
 const n=Number.MAX_SAFE_INTEGER;assert.throws(()=>billing.actualTotals([{id:'a',date:'2026-09-01',amount:n,currency:'KRW'},{id:'b',date:'2026-09-01',amount:2,currency:'KRW'}],'2026-09-01','2026-09-30'),/범위|금액/);
});
test('resumed billing restores current monthly costs and uncertainty suppresses unverified monthly costs',()=>{
 const c=contract([version('v1','2026-09-01',{status:'paused',pauseBilling:'stops',resumeDate:'2026-10-01'})]);
 assert.equal(summarizeContracts([c],'2026-10-01','2026-10-31').currencies.KRW.monthly,30000);
 c.termsHistory.versions.push(version('draft',null,{amount:50000},{state:'draft',uncertainFrom:'2026-10-01'}));
 const r=summarizeContracts([c],'2026-10-01','2026-10-31');assert.equal(r.currencies.KRW?.monthly??0,0);assert.equal(r.unknown,1);assert.equal(contractAmount(c,'2026-10-15'),null);
});
test('a historical matching snapshot separates current and captured personal shares',()=>{
 const c=contract([version('new','2026-09-01',{currency:'KRW',amount:30000,personalShare:8000})]);
 const p={id:'p',subscriptionId:c.id,date:'2026-09-15',plannedDate:'2026-09-15',amount:2000,currency:'USD',plannedAmount:2000,plannedCurrency:'USD',plannedPersonalAmount:1000,plannedVersionId:'old'};
 const r=billingReport([c],[p],'2026-09-01','2026-09-30');assert.equal(r.schedule[0].personalShare,1000);assert.equal(r.schedule[0].currentPersonalShare,8000);assert.equal(r.personal.USD,1000);assert.equal(r.personal.KRW,undefined);
});
test('future incomplete tax and variable pricing are disclosed for the queried period',()=>{
 const c=contract([version('v1','2026-09-01'),version('v2','2026-10-01',{amount:20000,taxStatus:'excluded',taxAmount:null,pricingMode:'hybrid'})]);
 const r=summarizeContracts([c],'2026-09-01','2026-10-31');assert.equal(r.unknownTax,1);assert.equal(r.variable,1);
});
test('history comparison ignores object key order but rejects known legacy bundle contradictions',()=>{
 const a=contract([version('v1','2026-09-01')],{bundleId:'same'}),b={...a,id:'b',termsHistory:Object.fromEntries(Object.entries(a.termsHistory).reverse())};
 assert.equal(summarizeContracts([a,b],'2026-09-01','2026-09-30').schedule.length,1);
 const x={id:'x',...base,bundleId:'old'},y={...x,id:'y',amount:50000};const r=summarizeContracts([x,y],'2026-09-01','2026-09-30');assert.equal(r.conflictingHistory,1);assert.equal(r.schedule.length,0);
});
