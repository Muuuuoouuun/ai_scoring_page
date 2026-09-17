import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {harness} from './api-harness.mjs';
const facts=harness().load('lib/promotion-facts.ts');
const fixed=JSON.parse(fs.readFileSync(new URL('../data/promotions.json',import.meta.url)))[0];
const ongoing={...fixed,id:'education',deadlineType:'ongoing',expiresAt:null,expiresInstant:null,expiresTimeZone:null,checkedAt:'2026-09-15',price:{amount:0,currency:null,period:'eligible-period',tax:'unknown'},renewalPrice:null};

test('explicitly ineligible benefits retain the user decision rather than requesting the same check',()=>{
 const reasons=facts.offerHolds(ongoing,{promotionEligibility:{education:'ineligible'}},'2026-09-15T12:00:00Z');
 assert.ok(reasons.includes('내 설정에서 해당하지 않음'));
 assert.ok(!reasons.includes('현재 자격 조건 재확인 필요'));
});
test('ongoing programs need explicit type and a recent valid source check',()=>{
 assert.equal(facts.deadlineState(ongoing,'2026-09-15T12:00:00Z'),'open');
 assert.equal(facts.deadlineState({...ongoing,deadlineType:undefined},'2026-09-15T12:00:00Z'),'uncertain');
 for(const checkedAt of ['','2026-02-30','2026-09-17'])assert.equal(facts.deadlineState({...ongoing,checkedAt},'2026-09-15T12:00:00Z'),'uncertain');
 assert.equal(facts.deadlineState(ongoing,'2026-10-15T00:00:00Z'),'uncertain');
 assert.equal(facts.emailDeadline(ongoing),'2026-10-15T00:00:00.000Z');
 assert.match(facts.deadlineLabel(ongoing),/상시|고정.*없/);
});
test('existing fixed-deadline material remains unchanged while ongoing type is material',()=>{
 const old={status:fixed.status,reviewStatus:fixed.reviewStatus,region:fixed.regionCodes,eligibility:fixed.eligibility,conditions:fixed.conditions,deadline:{date:fixed.expiresAt,instant:fixed.expiresInstant||null,timeZone:fixed.expiresTimeZone},price:fixed.price,renewalPrice:fixed.renewalPrice,benefitMonths:fixed.benefitMonths,benefitDuration:fixed.benefitDuration,features:fixed.offerFeatures};
 assert.equal(facts.canonical(facts.promotionMaterial(fixed)),facts.canonical(old));
 assert.notEqual(facts.canonical(facts.promotionMaterial(ongoing)),facts.canonical(facts.promotionMaterial({...ongoing,deadlineType:'unknown'})));
 assert.equal(facts.canonical(facts.promotionMaterial(ongoing)),facts.canonical(facts.promotionMaterial({...ongoing,checkedAt:'2026-09-16'})));
});
test('free ongoing programs do not certify unknown renewal price, eligibility or contradictory terms',()=>{
 assert.equal(facts.priceLabel(ongoing.price),'표시 요금 무료');
 const settings={promotionEligibility:{education:'eligible'},promotionEligibilityVersions:{education:facts.eligibilityFingerprint(ongoing)}};
 assert.equal(facts.offerHolds(ongoing,settings,'2026-09-15T12:00:00Z').length,0);
 assert.ok(facts.offerHolds({...ongoing,reviewStatus:'hold'},settings,'2026-09-15T12:00:00Z').some(x=>/검토/.test(x)));
 assert.ok(facts.offerHolds(ongoing,{...settings,maxPrice:0,currency:'KRW'},'2026-09-15T12:00:00Z').some(x=>/갱신가/.test(x)));
 assert.ok(facts.offerHolds(ongoing,settings,'2026-10-15T00:00:00Z').some(x=>/최근.*재확인/.test(x)));
});
