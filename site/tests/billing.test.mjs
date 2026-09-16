import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentDates, summarizeContracts, comparePeriods, toMinor, fromMinor, horizonEndDate } from '../lib/billing.ts';
import * as billing from '../lib/billing.ts';

test('month-end billing returns to the original day after February', () => {
  assert.deepEqual(paymentDates('2026-01-31', 'monthly', '2026-04-30'), ['2026-01-31','2026-02-28','2026-03-31','2026-04-30']);
});
test('monthly equivalent is distinct from bills due in the month', () => {
  const contracts = [
    {id:'a', amount:20000,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',status:'active'},
    {id:'b', amount:120000,currency:'KRW',cycle:'annual',nextDate:'2026-09-20',status:'active'},
    {id:'c', amount:null,currency:'KRW',cycle:'monthly',nextDate:'2026-09-20',status:'active'},
  ];
  const result=summarizeContracts(contracts,'2026-09-12','2026-09-30');
  assert.equal(result.currencies.KRW.monthly,30000);
  assert.equal(result.currencies.KRW.expected,140000);
  assert.equal(result.unknown,1);
});
test('mixed currencies are never silently summed and cancelled renewals are excluded', () => {
  const result=summarizeContracts([
    {id:'a',amount:2000,currency:'USD',cycle:'monthly',nextDate:'2026-09-15',status:'active'},
    {id:'b',amount:20000,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',status:'active'},
    {id:'c',amount:9999,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',status:'cancelled'},
  ],'2026-09-01','2026-09-30');
  assert.equal(result.currencies.KRW.expected,20000);
  assert.equal(result.currencies.USD.expected,2000);
});
test('same bundle is counted once; cancelled with explicit remaining bills is not erased', () => {
  const result=summarizeContracts([
    {id:'a',bundleId:'bundle',amount:30000,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',status:'active'},
    {id:'b',bundleId:'bundle',amount:30000,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',status:'active'},
    {id:'c',amount:10000,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',status:'cancelled',remainingPayments:2},
  ],'2026-09-01','2026-11-30');
  assert.equal(result.currencies.KRW.expected,110000);
});
test('short duration changes annual discount decision; preserve up-front cost', () => {
  assert.deepEqual(comparePeriods(20000,192000,8),{monthlyTotal:160000,annualTotal:192000,difference:-32000,upfront:192000,recommended:'monthly'});
  assert.equal(comparePeriods(20000,192000,12).difference,48000);
});
test('minor-unit conversion respects won and dollar precision',()=>{
  assert.equal(toMinor('20.99','USD'),2099);assert.equal(toMinor('20000','KRW'),20000);
  assert.equal(fromMinor(2099,'USD'),20.99);
  assert.throws(()=>toMinor('-5','KRW'));assert.throws(()=>toMinor('abc','USD'));
});
test('unknown-price contracts retain their upcoming dates without a zero price',()=>{
 const result=summarizeContracts([{id:'unknown',amount:null,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',status:'active'}],'2026-09-12','2026-09-30');
 assert.equal(result.unknown,1);assert.equal(result.schedule.length,1);assert.equal(result.schedule[0].amount,null);assert.equal(result.currencies.KRW,undefined);
});
test('bundle ordering does not lose known amounts and expired contracts stop contributing',()=>{
 const unknown={id:'a',bundleId:'b',amount:null,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',status:'active'};
 const known={...unknown,id:'b',amount:30000};const expired={...known,id:'c',bundleId:'',endDate:'2026-08-31'};
 const r=summarizeContracts([unknown,known,expired],'2026-09-12','2026-09-30');assert.equal(r.currencies.KRW.monthly,30000);assert.equal(r.unknown,0);assert.equal(r.schedule.length,1);
});

test('a three-month future window includes three monthly bills, not the next anniversary',()=>{const end=horizonEndDate('2026-09-12',3);assert.equal(end,'2026-12-11');const r=summarizeContracts([{id:'a',amount:12000,currency:'KRW',cycle:'monthly',nextDate:'2026-09-12',status:'active'}],'2026-09-12',end);assert.equal(r.schedule.length,3);assert.equal(r.currencies.KRW.expected,36000);});

test('unknown residual bills remain uncertain while explicit zero confirms none',()=>{
 const c={id:'a',amount:10000,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',status:'cancelled',remainingPayments:null};
 const unknown=summarizeContracts([c],'2026-09-12','2026-12-11');
 assert.equal(unknown.unknownRemaining,1);assert.equal(unknown.schedule.length,0);
 assert.equal(summarizeContracts([{...c,remainingPayments:0}],'2026-09-12','2026-12-11').unknownRemaining,0);
});
test('explicit residual obligations survive service access ending',()=>{
 for(const status of ['ended','cancelled']){
 const r=summarizeContracts([{id:'a',amount:10000,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',status,endDate:'2026-09-10',remainingPayments:2}],'2026-09-12','2026-12-11');
 assert.equal(r.currencies.KRW.expected,20000);assert.deepEqual(r.schedule.map(d=>d.date),['2026-09-15','2026-10-15']);assert.equal(r.currencies.KRW.monthly,0);
 }
});
test('prepayment ceiling separates lower price from feasible recommendation',()=>{
 const r=comparePeriods(20000,192000,12,100000);
 assert.equal(r.difference,48000);assert.equal(r.annualEligible,false);assert.equal(r.feasibleRecommendation,'monthly');
 assert.equal(comparePeriods(20000,192000,12,null).feasibleRecommendation,null);
 assert.equal(comparePeriods(20000,192000,12,200000).feasibleRecommendation,'annual');
});

test('missing payment date retains monthly cost and marks forecast incomplete',()=>{
 const r=summarizeContracts([{id:'a',amount:20000,currency:'KRW',cycle:'monthly',nextDate:null,status:'active'}],'2026-09-12','2026-12-11');
 assert.equal(r.currencies.KRW.monthly,20000);assert.equal(r.unknownDates,1);assert.equal(r.schedule.length,0);
});
test('price transition uses the dated renewal amount, preserving unknown renewal prices',()=>{
 const c={id:'a',amount:10000,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',status:'active',priceChangesAt:'2026-10-01',renewalAmount:20000};
 const r=summarizeContracts([c],'2026-09-01','2026-11-30');assert.equal(r.currencies.KRW.expected,50000);assert.deepEqual(r.schedule.map(d=>d.amount),[10000,20000,20000]);
 const unknown=summarizeContracts([{...c,renewalAmount:null}],'2026-09-01','2026-11-30');assert.equal(unknown.unknownFutureAmounts,2);assert.deepEqual(unknown.schedule.map(d=>d.amount),[10000,null,null]);
});
test('seat and tax uncertainty are not silently converted to a final total',()=>{
 const c={id:'a',amount:10000,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',status:'active',amountBasis:'perSeat',seats:null,taxStatus:'excluded',taxAmount:null};
 assert.equal(summarizeContracts([c],'2026-09-01','2026-09-30').unknown,1);
 const r=summarizeContracts([{...c,seats:2,taxAmount:2000}],'2026-09-01','2026-09-30');assert.equal(r.currencies.KRW.expected,22000);
 assert.equal(summarizeContracts([{...c,seats:2}],'2026-09-01','2026-09-30').unknownTax,1);
});
test('usage budget stays separate from fixed costs and planned bills',()=>{
 const r=summarizeContracts([{id:'a',amount:null,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',status:'active',pricingMode:'usage',usageBudget:50000}],'2026-09-01','2026-09-30');
 assert.equal(r.currencies.KRW,undefined);assert.equal(r.schedule[0].amount,null);assert.equal(r.variable,1);
});
test('refund reduces cash flow in its own month; settlement view never doubles fees',()=>{
 const payments=[{id:'p',date:'2026-09-15',amount:20000,currency:'KRW',entryType:'charge'},{id:'r',date:'2026-10-02',amount:5000,currency:'KRW',entryType:'refund',refundOfId:'p'}];
 assert.equal(billing.actualTotals(payments,'2026-09-01','2026-09-30').KRW,20000);assert.equal(billing.actualTotals(payments,'2026-10-01','2026-10-31').KRW,-5000);
 const fx=[{id:'fx',date:'2026-09-15',amount:2000,currency:'USD',entryType:'charge',settledAmount:28000,settledCurrency:'KRW',feeAmount:500}];
 assert.equal(billing.actualTotals(fx,'2026-09-01','2026-09-30',true).KRW,28000);
});
test('custom cycles retain original day after a clamped next bill and manual cycles invent no recurrence',()=>{
 assert.deepEqual(billing.paymentDates('2026-02-28','custom','2026-07-31',2,'2026-01-31'),['2026-03-31','2026-05-31','2026-07-31']);
 assert.deepEqual(billing.paymentDates('2026-09-15','manual','2027-09-15'),['2026-09-15']);
});
test('billing report matches across period boundaries, counts bundles once and never reopens refunded bills',()=>{
 const contracts=[{id:'a',amount:100,currency:'USD',cycle:'monthly',nextDate:'2026-09-15',status:'active',bundleId:'b',personalShare:25},{id:'b',amount:100,currency:'USD',cycle:'monthly',nextDate:'2026-09-15',status:'active',bundleId:'b',personalShare:25}];
 const payments=[{id:'p',subscriptionId:'b',date:'2026-08-31',amount:95,currency:'USD',plannedDate:'2026-09-15'},{id:'r',subscriptionId:'b',date:'2026-09-20',amount:20,currency:'USD',entryType:'refund',refundOfId:'p'}];
 const report=billing.billingReport(contracts,payments,'2026-09-01','2026-10-31','2026-09-21');
 assert.equal(report.actual.USD,-20);assert.equal(report.remaining.USD,100);assert.equal(report.forecast.USD,80);assert.equal(report.schedule[0].state,'confirmed');assert.equal(report.schedule[0].difference,-5);assert.equal(report.personal.USD,25);assert.equal(report.unknownShares,1);
});
test('billing report separates past unconfirmed occurrences and excludes unknown personal shares',()=>{
 const report=billing.billingReport([{id:'a',amount:100,currency:'USD',cycle:'monthly',nextDate:'2026-09-01',status:'active'}],[],'2026-09-01','2026-10-31','2026-09-12');
 assert.equal(report.unconfirmed,1);assert.equal(report.remaining.USD,100);assert.equal(report.unknownShares,2);assert.equal(report.personal.USD,undefined);
});
test('transition comparison leaves unknown expenses provisional and subtracts only confirmed refund',()=>{
 const known=billing.transitionComparison(100,120,12,{overlap:20,transition:30,refund:10});assert.equal(known.adjustedAnnual,160);assert.equal(known.difference,1040);assert.equal(known.complete,true);
 const unknown=billing.transitionComparison(100,120,12,{overlap:null,transition:30,refund:null});assert.equal(unknown.adjustedAnnual,150);assert.equal(unknown.complete,false);
});
test('transition upfront includes confirmed switch expenses before applying a cash ceiling',()=>{
 const r=billing.transitionComparison(100,120,12,{overlap:20,transition:30,refund:10},140);
 assert.equal(r.upfront,170);assert.equal(r.annualEligible,false);assert.equal(r.feasibleRecommendation,'monthly');
});
test('unknown renewal and pause retain separately confirmed residual charges',()=>{
 const base={id:'a',amount:100,currency:'USD',cycle:'monthly',nextDate:'2026-09-15',remainingPayments:2};
 for(const state of [{status:'unknown'},{status:'paused',pauseBilling:'unknown'}]){
 const s=billing.summarizeContracts([{...base,...state}],'2026-09-01','2026-12-31');assert.equal(s.currencies.USD.expected,200);assert.equal(s.schedule.length,2);assert.equal(s.currencies.USD.monthly,0);
 }
});
test('historic actual payment retains its own currency after a legacy contract currency edit',()=>{
 const r=billing.billingReport([{id:'a',amount:30000,currency:'USD',cycle:'monthly',nextDate:'2026-09-15',status:'active'}],[{id:'p',subscriptionId:'a',plannedDate:'2026-09-15',date:'2026-09-15',amount:30000,currency:'KRW'}],'2026-09-01','2026-09-30');assert.equal(r.schedule[0].actualCurrency,'KRW');assert.equal(r.schedule[0].difference,null);
});
