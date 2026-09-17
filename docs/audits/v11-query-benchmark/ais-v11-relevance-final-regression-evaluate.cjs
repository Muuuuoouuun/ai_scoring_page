const fs=require('node:fs'),crypto=require('node:crypto');
const p='/private/tmp/ais-v11-relevance-final-regression.json';
const j=JSON.parse(fs.readFileSync(p,'utf8'));
if(j.evaluatedAt)throw new Error('Preserve first final-regression evaluation');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const s of j.frozenSuites)if(hash(fs.readFileSync(s.path))!==s.sha256)throw new Error('Frozen cases changed');
const featureRender=['matchedFeatures','condition','sourceUrl','status'].every(k=>j.renderBranch[k]);
function feature(o,id,check){return featureRender&&!!o.top6.find(t=>t.id===id)?.matchedFeatures.some(f=>f.sourceUrl&&check(f));}
function qualified(o,terms){return j.renderBranch.unverifiedRequirements&&o.top6.every(t=>terms.every(term=>t.unverifiedRequirements.some(r=>r.includes(term))));}
for(const o of j.observations){
 const c=o.frozenCase,checks=[],top3=o.top6.slice(0,3),add=(name,passed,detail,type='runtime')=>checks.push({name,passed,detail,type});
 if(c.expectEmpty)add('expected empty',o.total===0,'count='+o.total);
 if(c.primaryAnyTop3)add('appropriate frozen candidate in top 3',top3.some(t=>c.primaryAnyTop3.includes(t.id)),c.primaryAnyTop3.join(', '));
 const ids=c.forbiddenIds||c.forbiddenIdsTop6||[],cats=c.forbiddenCategories||c.forbiddenCategoriesTop6||[],kinds=c.forbiddenKindsTop6||[];
 if(ids.length)add('explicit tool exclusions absent from displayed top 6',!o.top6.some(t=>ids.includes(t.id)),ids.join(', '));
 if(cats.length)add('explicit category exclusions absent from displayed top 6',!o.top6.some(t=>cats.includes(t.category)),cats.join(', '));
 if(kinds.length)add('explicit kind exclusions absent from displayed top 6',!o.top6.some(t=>kinds.includes(t.kind)),kinds.join(', '));
 if(c.allResultsWithinOwned)add('all results within synthetic owned fixture',o.allResults.every(t=>c.options.owned.includes(t.id)),c.options.owned.join(', '));
 if(c.options.free)add('all results obey free-plan filter',o.allResults.every(t=>t.pricing.includes('무료')),'Product label only.');
 if(c.options.korean)add('all results obey Korean label filter',o.allResults.every(t=>t.korean==='지원'),'Strict catalog support label.');
 if(c.mustNotInferExcludedCategories)add('positive image requirement not inverted',!o.meaning.exclusions.some(e=>e.type==='category'&&c.mustNotInferExcludedCategories.includes(e.value)),JSON.stringify(o.meaning.exclusions));
 if(o.id==='C5')add('Slack group huddles conflict excluded or specifically linked to display',!o.top6.some(t=>t.id==='slack')||feature(o,'slack',f=>f.name==='허들'&&f.condition.includes('그룹 허들')&&f.condition.includes('유료')),'Actual matchedFeatures condition/sourceUrl connected to Recommend branch; source observation, not UI.', 'runtime + source inspection');
 if(o.id==='H13')add('commercial free-hosting conflict not certified',o.total===0||(!o.top6.some(t=>t.id==='vercel')||feature(o,'vercel',f=>f.name.includes('Hobby')&&f.condition.includes('비상업용')))&&qualified(o,['상업용 사용','무료 플랜 이용 범위']),'Empty accepted; otherwise explicit current limitation and unverified commercial/free entitlement required.', 'runtime + source inspection');
 if(o.id==='H14'){
  add('Zapier free two-step limit exposed when present',!o.top6.some(t=>t.id==='zapier')||feature(o,'zapier',f=>f.name.includes('다단계')&&f.condition.includes('2단계')),'Actual condition/sourceUrl returned and display branch connected.', 'runtime + source inspection');
  add('every candidate qualifies unverified four-step free requirement',o.total===0||qualified(o,['네 단계 처리','무료 플랜 이용 범위']),'Each displayed candidate returns 네 단계 처리의 무료 플랜 이용 범위 under explicit 요구 조건 확인 필요 branch.', 'runtime + source inspection');
 }
 if(o.id==='H15')add('offline and device-local requirements unverified or empty',o.total===0||qualified(o,['오프라인 사용','기기 내부에서만 처리']),'Both required labels returned per candidate and connected to explicit unmet-evidence copy.', 'runtime + source inspection');
 if(o.id==='H16')add('unregistered booking purpose not presented as supported',o.total===0,'No candidates observed; frozen unsupported-purpose criterion accepts empty.', 'runtime');
 o.checks=checks;o.verdict=checks.every(c=>c.passed)?'PASS':'FAIL';
 o.scopeRisks=o.allResults.filter(t=>ids.includes(t.id)||cats.includes(t.category)||kinds.includes(t.kind)).map(t=>({id:t.id,rank:o.allResults.indexOf(t)+1,displayedTop6:o.top6.some(x=>x.id===t.id)}));
}
j.evaluatedAt=new Date().toISOString();
j.summary={total:j.observations.length,pass:j.observations.filter(o=>o.verdict==='PASS').length,fail:j.observations.filter(o=>o.verdict==='FAIL').length,suites:j.frozenSuites.map(s=>{const a=j.observations.filter(o=>o.suite===s.suite);return{suite:s.suite,total:a.length,pass:a.filter(o=>o.verdict==='PASS').length,fail:a.filter(o=>o.verdict==='FAIL').length};})};
j.gate624Opinion={criterion:'A varied set of realistic purpose/condition queries has evaluated relevance.',assessment:'Evidence supports completion of this evaluation-performed criterion. No gate file or score changed. This is not a statement that all relevance/exclusion behavior passes.',basis:'36 fixed cases span six work domains, explicit negation and product exclusions, positive image boundary, plan/language/owned constraints, unsupported requirements and unregistered purpose; expectations precede outputs; failures and limitations preserved.',remainingFailure:'H11 explicitly excluded coding model GPT-6 Astra appears at rank 4.'};
j.evaluationScope='Fixed regression only. Previously disclosed holdout16 reused as regression, not independent new holdout. Runtime source-data/rendering-path inspection, not browser UI or actual user research.';
fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');
console.log(JSON.stringify({summary:j.summary,failed:j.observations.filter(o=>o.verdict==='FAIL').map(o=>({id:o.id,checks:o.checks.filter(c=>!c.passed),risks:o.scopeRisks})),gate:j.gate624Opinion},null,2));
