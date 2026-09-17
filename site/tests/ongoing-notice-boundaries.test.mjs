import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {harness} from './api-harness.mjs';
const root=new URL('..',import.meta.url).pathname.replace(/\/$/,'');
const sources=JSON.parse(fs.readFileSync(root+'/data/promotions.json','utf8'));
const catalog=JSON.parse(fs.readFileSync(root+'/data/catalog.json','utf8'));
const facts=harness().load('lib/promotion-facts.ts');
const ongoing=sources.find(p=>p.id==='notion-individual-education');

test('original Google material hash is unchanged',async()=>{
 assert.equal(await facts.fingerprint(facts.promotionMaterial(sources[0])),'94da3afa2d79a0e08c049846dc15e383c70af3bccead62ae3eb8726a49ac762e');
});
test('ongoing exact reviewed instant + 30-day boundary and contradictory dates fail closed',()=>{
 const start=Date.parse(ongoing.checkedAtInstant),end=start+30*86400000;
 assert.equal(facts.deadlineState(ongoing,new Date(start-1).toISOString()),'uncertain');
 assert.equal(facts.deadlineState(ongoing,new Date(start).toISOString()),'open');
 assert.equal(facts.deadlineState(ongoing,new Date(end-1).toISOString()),'open');
 assert.equal(facts.deadlineState(ongoing,new Date(end).toISOString()),'uncertain');
 assert.equal(facts.emailDeadline(ongoing),new Date(end).toISOString());
 assert.equal(facts.deadlineState({...ongoing,expiresAt:'2026-12-31'},new Date(start).toISOString()),'uncertain');
 assert.equal(facts.emailDeadline({...ongoing,expiresInstant:'2026-12-31T00:00:00Z'}),'0000');
});
test('impossible calendar date in checkedAtInstant must not become a normalized valid review',()=>{
 const p={...ongoing,checkedAt:'2026-02-30',checkedAtInstant:'2026-02-30T00:00:00Z'};
 assert.equal(facts.deadlineState(p,'2026-03-03T00:00:00Z'),'uncertain');
});
test('new renewal policy displayed in notices participates in material identity',()=>{
 const changed={...ongoing,renewalNote:'QA hypothetical official renewal policy materially changed'};
 assert.notEqual(facts.canonical(facts.promotionMaterial(ongoing)),facts.canonical(facts.promotionMaterial(changed)));
});
async function fixture(){
 let clock='2026-09-15T01:00:00Z'; const requests=[];
 const p={...structuredClone(ongoing),id:'audit-ongoing',name:'LOCAL AUDIT ONGOING',checkedAt:'2026-09-01',checkedAtInstant:'2026-09-01T00:00:00Z',revision:1};
 const h=harness(async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');requests.push(JSON.parse(options.body));return Response.json({id:'mock-'+requests.length});},{now:()=>clock,jsonFixtures:{'data/promotions.json':[p],'data/catalog.json':structuredClone(catalog)}});
 const f=h.load('lib/promotion-facts.ts'),n=h.load('lib/notifications.ts');
 const s=await h.save('settings',{interests:['notion'],includeAlternatives:false,inApp:true,email:true,emailMode:'matched',emailTimeZone:'UTC',emailTime:'00:00',promotionEligibility:{[p.id]:'eligible'},promotionEligibilityVersions:{[p.id]:f.eligibilityFingerprint(p)}});
 assert.equal(s.status,200);
 async function run(){await n.generateNotifications('alpha');return n.deliverEmailForUser('alpha');}
 await run();assert.equal(requests.filter(r=>r.text.includes(p.name)).length,1);
 return {h,p,f,n,requests,run,at:v=>clock=v};
}
for(const boundary of ['stale','future','contradictory'])test('material correction cannot bypass ongoing '+boundary+' source review hold',async()=>{
 const f=await fixture();f.p.revision=2;f.p.price.amount=5;
 if(boundary==='stale')f.at('2026-10-02T01:00:00Z');
 else {f.at('2026-09-15T02:00:00Z');if(boundary==='future')f.p.checkedAtInstant='2026-09-16T00:00:00Z';else f.p.expiresAt='2026-12-31';}
 const notice=(await f.n.currentNotices('alpha')).notices.find(n=>n.cardKey==='promotion:audit-ongoing');
 await f.run();
 const observed={boundary,emailAllowed:notice.emailAllowed,emailNotAfter:notice.emailNotAfter,holds:notice.holds,offerRequests:f.requests.filter(r=>r.text.includes(f.p.name)).length};

 assert.equal(notice.emailAllowed,false,'Correction is not permission to skip source freshness/validity');
 assert.equal(observed.offerRequests,1,'Only the original fresh notice may reach the mock provider');
});
