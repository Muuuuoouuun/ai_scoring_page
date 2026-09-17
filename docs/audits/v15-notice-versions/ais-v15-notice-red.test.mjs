import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const root='/Users/bigmac_moon/dev/ai_score/site';
const read=p=>fs.readFileSync(root+'/'+p,'utf8');
const snapshot=Object.fromEntries(['lib/notice-candidates.ts','lib/notifications.ts','lib/email-delivery.ts','tests/api-harness.mjs','data/promotions.json','data/catalog.json'].map(p=>[p,createHash('sha256').update(read(p)).digest('hex')]));
// Only the test adapter is extended in memory: fixed root plus JSON-object injection.
// Actual Site modules and SQL migrations are read verbatim; no source file is written.
const originalHarness=read('tests/api-harness.mjs');
const rootLine="const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');";
const jsonLine="if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));";
assert.ok(originalHarness.includes(rootLine)&&originalHarness.includes(jsonLine),'baseline harness seam must be explicit');
const adaptedHarness=originalHarness.replace(rootLine,'const root='+JSON.stringify(root)+';').replace(jsonLine,"if(file.endsWith('.json'))return options.jsonFixtures?.[path.relative(root,file)]??JSON.parse(fs.readFileSync(file,'utf8'));");
const {harness}=await import('data:text/javascript;base64,'+Buffer.from(adaptedHarness).toString('base64'));
console.log('BASELINE '+JSON.stringify({checkedAt:new Date().toISOString(),snapshot,network:'explicit local fetch mocks only',fixtures:'synthetic in-memory data, not official claims'}));

const baselinePromotions=JSON.parse(read('data/promotions.json'));
const baselineCatalog=JSON.parse(read('data/catalog.json'));
const pId='local-promotion-repro';
const settings={interests:['gemini'],includeAlternatives:false,inApp:true,email:true,emailMode:'matched',emailTimeZone:'UTC',emailTime:'00:00',promotionEligibility:{[pId]:'eligible'}};
async function fixture(overrides={}){
 let clock='2026-09-12T10:00:00.000Z';
 const promotions=[{...structuredClone(baselinePromotions[0]),id:pId,name:'LOCAL TEST PROMOTION',summary:'LOCAL initial monthly offer',status:'active',expiresAt:'2026-12-31',expiresTimeZone:'UTC',checkedAt:'2026-09-12'}];
 const catalog=structuredClone(baselineCatalog),requests=[];
 const h=harness(async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');requests.push({body:JSON.parse(options.body),key:options.headers['Idempotency-Key']});return Response.json({id:'local-provider-'+requests.length});},{now:()=>clock,jsonFixtures:{'data/promotions.json':promotions,'data/catalog.json':catalog}});
 const saved=await h.save('settings',{...settings,...overrides});assert.equal(saved.status,200);assert.equal(saved.data.record.payload.emailTimingConfirmed,true);
 const n=h.load('lib/notifications.ts');
 return {h,n,p:promotions[0],catalog,requests,settingsId:saved.data.record.id,at:value=>{clock=value;},async candidates(){return (await n.currentNotices('alpha')).notices.filter(n=>n.key.startsWith('promotion:'+pId+':'));},async process(){await n.generateNotifications('alpha');return n.deliverEmailForUser('alpha');},promotionRequests(){return requests.filter(r=>r.body.text.includes('LOCAL TEST PROMOTION'));}};
}
function observed(t,data){t.diagnostic(JSON.stringify(data));}

test('RED L92: changing only checkedAt must not redeliver the same promotion version',async t=>{
 const f=await fixture();await f.process();assert.equal(f.promotionRequests().length,1);const oldKey=(await f.candidates())[0].key;
 f.p.checkedAt='2026-09-13';f.at('2026-09-13T10:00:00.000Z');const result=await f.process();
 observed(t,{beforeKey:oldKey,afterKey:(await f.candidates())[0].key,promotionProviderRequests:f.promotionRequests().length,secondProcess:result});
 assert.equal(f.promotionRequests().length,1,'a new inspection date is not a new meaningful event version');
});

test('RED L92/L96: meaningful price correction on the same checked date updates the card and becomes a new candidate',async t=>{
 const f=await fixture();f.p.summary='LOCAL monthly price KRW 20000 including tax';await f.process();assert.equal(f.promotionRequests().length,1);const beforeKey=(await f.candidates())[0].key;
 f.p.summary='LOCAL monthly price corrected to KRW 10000 including tax';f.p.conditions=['Official price correction applicable to the same eligible audience'];f.at('2026-09-12T11:00:00.000Z');const result=await f.process();const candidate=(await f.candidates())[0];const cards=f.h.sql.prepare("SELECT source_key,body FROM notifications WHERE source_key LIKE ?").all('promotion:'+pId+':%');
 observed(t,{beforeKey,afterKey:candidate.key,currentCandidateBody:candidate.body,persistedBodies:cards.map(c=>c.body),promotionProviderRequests:f.promotionRequests().length,secondProcess:result});
 assert.equal(f.promotionRequests().length,2,'an affected opted-in customer in an open matched window needs a correction candidate');
 assert.ok(cards.some(c=>c.body.includes('corrected to KRW 10000')),'app records must expose the current correction');
});

for(const status of ['ended','withdrawn'])test('RED L86/L94: queued promotion status '+status+' is rechecked before dispatch',async t=>{
 const f=await fixture();await f.n.generateNotifications('alpha');f.p.status=status;const candidates=await f.candidates();const result=await f.n.deliverEmailForUser('alpha');
 observed(t,{status,candidates:candidates.map(c=>({key:c.key,emailAllowed:c.emailAllowed})),promotionProviderRequests:f.promotionRequests().length,result});
 assert.equal(f.promotionRequests().length,0,'ended or withdrawn promotion must not enter the provider payload');
});

test('RED L94/L104: an explicitly absolute expiry is honored after the queued item expires',async t=>{
 const f=await fixture();f.p.expiresAt='2026-09-12T10:00:01.000Z';f.p.expiresTimeZone='UTC';await f.n.generateNotifications('alpha');f.at('2026-09-12T10:00:02.000Z');
 const result=await f.n.deliverEmailForUser('alpha');observed(t,{deadline:f.p.expiresAt,now:'2026-09-12T10:00:02.000Z',promotionProviderRequests:f.promotionRequests().length,result});
 assert.equal(f.promotionRequests().length,0,'two instants with explicit Z are ordered without a date-only cutoff');
});

test('OBSERVATION: unknown deadline zone examined around UTC midnight; exact fallback policy is not prescribed',async t=>{
 const f=await fixture();f.p.expiresAt='2026-09-12';f.p.expiresTimeZone=null;f.p.region='LOCAL region unspecified';f.p.regionCodes=[];
 f.at('2026-09-12T23:59:59.999Z');const before=await f.candidates();f.at('2026-09-13T00:00:00.000Z');const after=await f.candidates();
 observed(t,{policyChoicePending:true,dateOnly:f.p.expiresAt,sourceTimeZone:f.p.expiresTimeZone,beforeUtcMidnight:before.map(n=>({emailAllowed:n.emailAllowed,body:n.body})),afterUtcMidnight:after.length,sourceUnchanged:true});
 assert.equal(f.p.expiresTimeZone,null,'this is an uncertainty fixture, not a fabricated official time zone');
});

test('OBSERVATION: source deadline zone is unknown while current fixed Seoul date rolls over',async t=>{
 const f=await fixture();f.p.expiresAt='2026-09-12';f.p.expiresTimeZone=null;f.p.region='LOCAL region unspecified';f.p.regionCodes=[];
 f.at('2026-09-12T14:59:59.999Z');const before=await f.candidates();f.at('2026-09-12T15:00:00.000Z');const after=await f.candidates();
 observed(t,{policyChoicePending:true,dateOnly:f.p.expiresAt,sourceTimeZone:null,beforeSeoulMidnight:before.map(n=>({emailAllowed:n.emailAllowed,body:n.body})),afterSeoulMidnight:after.length,sourceUnchanged:true});
 assert.equal(f.p.expiresTimeZone,null,'no official deadline time zone is supplied by this fixture');
});

test('RED L70/L94/L105/L121: a stored price ceiling with unverified monthly offer cost must not become a matched promotion email',async t=>{
 const f=await fixture({maxPrice:10000,currency:'KRW'});f.p.summary='LOCAL offer cost and tax not confirmed';f.p.conditions=['LOCAL monthly equivalent cost not confirmed'];
 const stored=f.h.record(f.settingsId);assert.equal(stored.maxPrice,10000);assert.equal(stored.currency,'KRW');const candidates=await f.candidates();await f.process();
 observed(t,{savedMaxPrice:stored.maxPrice,savedCurrency:stored.currency,priceEvidence:'unknown',emailAllowed:candidates[0]?.emailAllowed,promotionProviderRequests:f.promotionRequests().length});
 assert.equal(f.promotionRequests().length,0,'explicit price constraint is unknown, not satisfied');
});

test('RED L70/L105: optional needed-feature preference is not silently discarded by settings storage',async t=>{
 const f=await fixture({neededFeatures:['offline-document-editing']});const saved=f.h.record(f.settingsId);observed(t,{requestedNeededFeatures:['offline-document-editing'],storedNeededFeatures:saved.neededFeatures??null});
 assert.deepEqual(saved.neededFeatures,['offline-document-editing'],'neededFeatures is a proposed fixture field; equivalent explicit storage may replace it, silent loss may not');
});

test('RED L65/L68/L94: same-use-case alternative with unverified required feature is not a qualified promotion email',async t=>{
 const f=await fixture({interests:['chatgpt'],includeAlternatives:true});const a=f.catalog.find(x=>x.id==='chatgpt'),b=f.catalog.find(x=>x.id==='gemini');a.useCases=['LOCAL document task'];b.useCases=['LOCAL document task'];b.features=[{name:'Online writing',description:'LOCAL online only evidence',status:'supported',condition:'Online',sourceUrl:'https://example.invalid/feature'}];
 // Raw settings fixture isolates the candidate predicate; the API-loss case is separate above.
 const saved=f.h.record(f.settingsId);saved.neededFeatures=['offline-document-editing'];f.h.sql.prepare('UPDATE private_records SET payload=? WHERE id=?').run(JSON.stringify(saved),f.settingsId);
 const candidates=await f.candidates();await f.process();observed(t,{rawFixtureNeededFeatures:saved.neededFeatures,offeredFeatureEvidence:b.features.map(x=>x.name),alternativeCandidate:candidates[0]??null,promotionProviderRequests:f.promotionRequests().length});
 assert.equal(f.promotionRequests().length,0,'same task overlap cannot stand in for a required feature check');
});

test('CONTROL: unchanged accepted promotion is not redelivered; explicit ineligibility is excluded',async t=>{
 const f=await fixture();await f.process();f.at('2026-09-13T10:00:00.000Z');await f.process();assert.equal(f.promotionRequests().length,1);
 const g=await fixture({promotionEligibility:{[pId]:'ineligible'}});await g.process();assert.equal(g.promotionRequests().length,0);observed(t,{unchangedPromotionRequests:1,ineligiblePromotionRequests:0});
});
