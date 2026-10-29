import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {harness} from './api-harness.mjs';
const load=()=>harness().load('lib/tool-pricing.ts');
const price=(monthly,extra={})=>({toolId:'fixture',freeTier:'unknown',freeNote:'',paid:{kind:'subscription',plan:'Standard',currency:'USD',unit:'person',monthly,annualMonthly:null,annualTotal:null,note:'',...extra},sourceUrl:'https://example.invalid/pricing',checkedAt:'2026-10-22'});

test('pricing data covers representative applications with dated official evidence',()=>{
 assert.ok(fs.existsSync(new URL('../data/tool-pricing.json',import.meta.url)),'Structured pricing data must exist');
 const rows=JSON.parse(fs.readFileSync(new URL('../data/tool-pricing.json',import.meta.url),'utf8'));
 const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8'));
 assert.ok(rows.filter(x=>x.paid.kind==='subscription').length>=15);
 assert.equal(new Set(rows.map(x=>x.toolId)).size,rows.length);
 for(const row of rows){
  assert.ok(catalog.some(t=>t.id===row.toolId),row.toolId);
  assert.match(row.sourceUrl,/^https:\/\//);assert.match(row.checkedAt,/^\d{4}-\d{2}-\d{2}$/);
  assert.ok(['available','unavailable','unknown','trial'].includes(row.freeTier));
  if(row.paid.kind==='subscription')assert.ok(row.paid.monthly>0||row.paid.annualMonthly>0);
  for(const field of ['monthly','annualMonthly','annualTotal'])assert.ok(row.paid[field]===null||(Number.isFinite(row.paid[field])&&row.paid[field]>0));
 }
});

test('paid comparison uses matching billing periods and reports lower, equal, and higher',()=>{
 const api=load();
 assert.equal(api.comparePricing(price(20),price(10)).relation,'lower');
 assert.equal(api.comparePricing(price(20),price(20)).relation,'equal');
 assert.equal(api.comparePricing(price(20),price(30)).relation,'higher');
 assert.equal(api.comparePricing(price(20),price(10)).difference,10);
 assert.equal(api.comparePricing(price(20,{annualMonthly:12}),price(15,{annualMonthly:14}),'annual').relation,'higher');
});

test('missing, usage, quote, other currency and workspace prices never become zero-priced alternatives',()=>{
 const api=load();
 for(const candidate of [undefined,price(null),price(0),price(-10),price(NaN),price(10,{kind:'usage'}),price(10,{kind:'quote'}),price(10,{kind:'unknown'}),price(10,{currency:'KRW'}),price(10,{unit:'workspace'})]){
  assert.equal(api.comparableMonthlyPrice(candidate),null);
  assert.equal(api.comparePricing(price(20),candidate).relation,'unavailable');
  assert.equal(api.matchesPriceFilter(price(20),candidate,'lower-or-equal'),false);
  assert.equal(api.matchesPriceFilter(price(20),candidate,'free'),false);
 }
 assert.equal(api.comparePricing(undefined,price(10)).relation,'unavailable');
 assert.equal(api.matchesPriceFilter(undefined,price(10),'lower-or-equal'),false);
});

test('annual prices are not silently compared with monthly prices',()=>{
 const api=load(),annualOnly=price(null,{annualMonthly:8,annualTotal:96});
 assert.equal(api.comparableMonthlyPrice(annualOnly),null);
 assert.equal(api.comparableMonthlyPrice(annualOnly,'annual'),8);
 assert.equal(api.comparePricing(price(10),annualOnly).relation,'unavailable');
 assert.equal(api.comparePricing(price(10),annualOnly,'annual').relation,'unavailable');
});

test('free plan filter is independent of paid comparison and excludes one-time trials',()=>{
 const api=load(),free={...price(30),freeTier:'available'},trial={...price(5),freeTier:'trial'};
 assert.equal(api.matchesPriceFilter(price(20),free,'free'),true);
 assert.equal(api.matchesPriceFilter(price(20),free,'lower-or-equal'),false);
 assert.equal(api.matchesPriceFilter(price(20),trial,'free'),false);
 assert.equal(api.matchesPriceFilter(price(20),price(20),'lower-or-equal'),true);
 assert.equal(api.matchesPriceFilter(undefined,undefined,'all'),true);
});

test('official yearly totals are not reconstructed from rounded marketing monthly prices',()=>{
 const api=load(),claude=api.getToolPricing('claude');
 assert.equal(claude.paid.monthly,20);
 assert.equal(claude.paid.annualTotal,200);
 assert.equal(api.comparableMonthlyPrice(claude,'annual'),200/12);
 assert.equal(api.getToolPricing('not-a-tool'),undefined);
 assert.equal(api.getToolPricing('runway').freeTier,'trial');
});
