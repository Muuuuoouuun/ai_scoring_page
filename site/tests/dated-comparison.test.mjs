import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';
const base={id:'old',amount:20000,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',anchorDate:'2026-09-15',status:'active',taxStatus:'included',amountBasis:'total',pricingMode:'fixed'};
const input=(patch={})=>({from:'2026-09-12',until:'2026-12-31',switchDate:'2026-10-01',oldBilling:'stop',oldLastChargeDate:null,oldAccess:'ends',oldAccessUntil:'2026-10-31',candidate:{name:'Annual',amount:120000,currency:'KRW',cycle:'annual',nextDate:'2026-10-01',anchorDate:'2026-10-01',taxStatus:'included',amountBasis:'total',pricingMode:'fixed'},adjustments:[],extrasConfirmed:true,quoteSource:'Provider quote',quoteCheckedAt:'2026-09-12',criteria:{keepFit:'yes',changeFit:'yes',eligibility:'yes',changeWilling:'yes',budgets:{KRW:200000}},...patch});
const calc=(v=input(),cs=[base],ps=[],asOf='2026-09-12')=>harness().load('lib/dated-comparison.ts').datedComparison(cs,ps,v,asOf);
const adjustment=(patch={})=>({id:'a',type:'fee',scenario:'change',date:'2026-10-01',amount:10000,currency:'KRW',confirmed:true,source:'Confirmed quote',...patch});
test('same dates retain pre-switch invoices and distinguish overlap access from charges',()=>{
 const r=calc(input({oldBilling:'through',oldLastChargeDate:'2026-10-15'}));assert.equal(r.keep.total.KRW,80000);assert.equal(r.change.total.KRW,160000);assert.equal(r.overlap.days,31);assert.equal(r.change.events.filter(e=>e.kind==='old').length,2);assert.equal(r.cheaper,'keep');
});
test('future matched prepayments suppress only original contract; bundle charged once',()=>{
 const cs=[{...base,bundleId:'suite'},{...base,id:'peer',bundleId:'suite'}],ps=[{id:'paid',subscriptionId:'peer',plannedDate:'2026-10-15',plannedKey:'bundle:suite@2026-10-15',date:'2026-08-01',amount:20000,currency:'KRW'}];
 const r=calc(input({from:'2026-10-01',until:'2026-11-30',switchDate:'2026-10-15',candidate:{...input().candidate,amount:30000,nextDate:'2026-10-15',anchorDate:'2026-10-15'}}),cs,ps);
 assert.equal(r.keep.total.KRW,20000);assert.equal(r.change.total.KRW,30000);assert.equal(r.change.events.filter(e=>e.kind==='new').length,1);
});
test('paid annual access is not charged again for overlap; refund is not invented',()=>{
 const r=calc(input(),[{...base,cycle:'annual',nextDate:'2027-01-01',anchorDate:'2026-01-01'}],[{id:'p',subscriptionId:'old',date:'2026-01-01',amount:240000,currency:'KRW'}]);assert.equal(r.keep.total.KRW??0,0);assert.equal(r.change.total.KRW,120000);assert.equal(r.overlap.days,31);
});
test('calendar anchors, inclusive boundaries and temporary renewal price are counted',()=>{
 const v=input({from:'2026-10-01',until:'2027-03-31',candidate:{...input().candidate,cycle:'monthly',amount:10000,nextDate:'2026-10-31',anchorDate:'2026-10-31',priceChangesAt:'2026-12-31',renewalAmount:20000}});
 const r=calc(v);assert.equal(r.change.total.KRW,100000);assert.deepEqual(Array.from(r.change.events.filter(e=>e.kind==='new'),e=>e.date),['2026-10-31','2026-11-30','2026-12-31','2027-01-31','2027-02-28','2027-03-31']);
});
test('unknown renewal, tax, usage and extra conditions block final winner',()=>{
 for(const patch of [{renewalAmount:null,priceChangesAt:'2026-11-01'},{taxStatus:'unknown'},{pricingMode:'hybrid'},{amountBasis:'perSeat',seats:null}]){const r=calc(input({candidate:{...input().candidate,cycle:'monthly',...patch}}));assert.equal(r.change.complete,false);assert.equal(r.cheaper,null);assert.equal(r.recommendation,null);}
 const r=calc(input({extrasConfirmed:false}));assert.equal(r.cheaper,null);
});
test('later refund reduces net total but cannot pay an earlier gross invoice',()=>{
 const r=calc(input({criteria:{...input().criteria,budgets:{KRW:125000}},adjustments:[adjustment(),adjustment({id:'refund',type:'refund',date:'2026-11-01',amount:100000})]}));assert.equal(r.change.total.KRW,50000);assert.equal(r.change.peak.KRW.amount,130000);assert.equal(r.change.peak.KRW.date,'2026-10-01');assert.equal(r.change.feasible,false);assert.equal(r.cheaper,'change');assert.equal(r.recommendation,'keep');
});
test('upfront preparation before query start still counts, after-period refund does not',()=>{
 const r=calc(input({from:'2026-11-01',adjustments:[adjustment({type:'refund',date:'2027-01-01',amount:100000})]}));assert.equal(r.change.total.KRW??0,0);assert.equal(r.change.peak.KRW.amount,120000);assert.equal(r.change.events.length,0);
});
test('unknown fees, refund date or confirmation never default to zero',()=>{
 for(const patch of [{amount:null},{date:null},{confirmed:false},{source:''}]){const r=calc(input({adjustments:[adjustment(patch)]}));assert.equal(r.change.complete,false);assert.equal(r.cheaper,null);}
});
test('already recorded refunds are common once and foreign payment links rejected',()=>{
 const ps=[{id:'refund',subscriptionId:'old',date:'2026-09-12',amount:5000,currency:'KRW',entryType:'refund'}];
 const r=calc(input({adjustments:[adjustment({type:'refund',recordedPaymentId:'refund',date:'2026-09-12',amount:5000})]}),[base],ps);assert.equal(r.keep.total.KRW,75000);assert.equal(r.change.total.KRW,135000);assert.equal(r.change.events.filter(e=>e.kind==='refund').length,0);
 assert.throws(()=>calc(input({adjustments:[adjustment({type:'refund',recordedPaymentId:'foreign'})]})),/환불|기록/);
});
test('mixed currencies are not collapsed into a scalar winner',()=>{
 const r=calc(input({candidate:{...input().candidate,currency:'USD',amount:20000}}));assert.equal(r.keep.total.KRW,80000);assert.equal(r.change.total.KRW,20000);assert.equal(r.change.total.USD,20000);assert.equal(r.cheaper,null);assert.equal(r.recommendation,null);
});
test('fit, access, discount eligibility and willingness constrain recommendation separately',()=>{
 for(const criteria of [{changeFit:'no'},{eligibility:'no'},{changeWilling:'no'},{changeFit:'unknown'}]){const r=calc(input({candidate:{...input().candidate,amount:30000},criteria:{...input().criteria,...criteria}}));assert.equal(r.cheaper,'change');assert.notEqual(r.recommendation,'change');}
 const r=calc(input({criteria:{...input().criteria,keepFit:'no'}}),[{...base,status:'ended',remainingPayments:0}]);assert.equal(r.keep.feasible,false);assert.equal(r.recommendation,'change');
});
test('unknown old last bill or pause does not fabricate a free keep plan',()=>{
 assert.equal(calc(input({oldBilling:'unknown'})).change.complete,false);
 const r=calc(input(),[{...base,status:'paused',pauseBilling:'unknown'}]);assert.equal(r.keep.complete,false);assert.equal(r.cheaper,null);
});
test('dated histories preserve residual counts and later changes cannot revive cut-off bills',()=>{
 const terms={...base,status:'cancelled',remainingPayments:2,remainingFromDate:'2026-09-15'};
 const history={schemaVersion:1,revision:2,knownFrom:'2026-09-12',versions:[{id:'v1',state:'confirmed',effectiveFrom:'2026-09-12',terms,recordedAt:'2026-09-12',reason:'initial'},{id:'v2',state:'confirmed',effectiveFrom:'2026-10-01',terms:{...terms,amount:25000},recordedAt:'2026-09-12',reason:'new price'}]};
 const r=calc(input({oldBilling:'through',oldLastChargeDate:'2026-10-15',candidate:{...input().candidate,amount:30000}}),[{...base,termsHistory:history}]);assert.equal(r.keep.total.KRW,45000);assert.equal(r.change.total.KRW,75000);
 const active={...history,versions:history.versions.map(v=>({...v,terms:{...v.terms,status:'active'}}))};const s=calc(input({candidate:{...input().candidate,amount:30000}}),[{...base,termsHistory:active}]);assert.equal(s.keep.total.KRW,95000);assert.equal(s.change.total.KRW,50000);
});
test('invalid dates, switch before today, mismatched identities and duplicate adjustments fail',()=>{
 for(const patch of [{switchDate:'2026-09-11'},{until:'2026-02-30'},{from:'2027-01-01'},{candidate:{...input().candidate,nextDate:'2026-09-30'}},{adjustments:[adjustment(),adjustment()]}])assert.throws(()=>calc(input(patch)));
 assert.throws(()=>calc(input(),[base,{...base,id:'unrelated'}]));
});
test('misaligned first bill cannot make an annual quote disappear',()=>{
 assert.throws(()=>calc(input({candidate:{...input().candidate,nextDate:'2026-10-02',anchorDate:'2026-10-01'}})),/기준|주기|청구/);
});
test('mandatory preparation excluded from query does not produce a cheaper or recommended claim',()=>{
 const r=calc(input({from:'2026-11-01'}));assert.equal(r.cheaper,null);assert.equal(r.recommendation,null);assert.equal(r.preparationOutsidePeriod,true);
});
test('future-dated actual records require reconciliation before any cash recommendation',()=>{
 const ps=[{id:'future',subscriptionId:'old',date:'2026-10-15',plannedDate:'2026-10-15',amount:200000,currency:'KRW'}];const r=calc(input({criteria:{...input().criteria,budgets:{KRW:1000}}}),[base],ps);assert.equal(r.keep.complete,false);assert.equal(r.recommendation,null);
});
test('a manual refund matching a recorded refund must be linked instead of subtracted twice',()=>{
 const ps=[{id:'refund',subscriptionId:'old',date:'2026-09-12',amount:100000,currency:'KRW',entryType:'refund'}],r=calc(input({adjustments:[adjustment({type:'refund',date:'2026-09-12',amount:100000})]}),[base],ps);assert.equal(r.change.total.KRW,40000);assert.equal(r.change.complete,false);assert.equal(r.recommendation,null);
});
test('an explicitly ended existing contract cannot satisfy a later full comparison period',()=>{
 const r=calc(input(),[{...base,status:'ended',remainingPayments:0,endDate:'2026-10-31'}]);assert.equal(r.keep.feasible,false);assert.notEqual(r.recommendation,'keep');assert.equal(r.keep.coverageConflict,true);
});
