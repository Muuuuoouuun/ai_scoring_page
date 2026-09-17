import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';
const api=harness().load('lib/resources.ts');

test('every site is classified, priced and sourced',()=>{
 assert.ok(api.resources.length>=20);
 for(const site of api.resources){
  assert.ok(api.resourceGroups.includes(site.group),site.name+' has an unknown group');
  assert.ok(['free','freemium','paid'].includes(site.pricing),site.name+' has an unknown pricing label');
  assert.ok(['full','partial','none'].includes(site.koreanFriendly),site.name+' has an unknown Korean level');
  assert.match(site.url,/^https?:\/\//,site.name+' needs a link');
  assert.ok(site.tagline.length<=60,site.name+' tagline is too long');
  assert.ok(site.useCase.length>20,site.name+' needs a usage note');
  assert.ok(site.strength.length>10&&site.caution.length>10,site.name+' needs a strength and a caution');
  assert.ok(site.pricingDetail.length>5,site.name+' needs pricing detail');
 }
});

test('site names are unique so cards do not collide',()=>{
 const names=api.resources.map(s=>s.name);
 assert.equal(new Set(names).size,names.length);
});

test('grouping keeps the canonical order and drops empty groups',()=>{
 const grouped=api.groupedResources();
 const order=grouped.map(g=>g.group);
 assert.deepEqual(order,api.resourceGroups.filter(g=>order.includes(g)));
 for(const entry of grouped)assert.ok(entry.sites.length>0);
 assert.equal(grouped.reduce((sum,g)=>sum+g.sites.length,0),api.resources.length);
});

test('asset sites state a licence condition rather than a bare permission',()=>{
 for(const site of api.resources.filter(s=>s.group==='assets')){
  assert.ok(!/^상업적 사용 가능\.?$/.test(site.caution),site.name+' needs the real licence condition');
 }
});
