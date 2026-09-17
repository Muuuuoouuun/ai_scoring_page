const fs=require('node:fs'),crypto=require('node:crypto');
const tmp='/private/tmp',p=tmp+'/ais-v11-relevance-initial-observations.json';
const j=JSON.parse(fs.readFileSync(p,'utf8'));
const snapshot=JSON.parse(fs.readFileSync(tmp+'/ais-v11-relevance-initial-source-snapshot.json','utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const suite of j.frozenSuites)if(hash(fs.readFileSync(suite.path))!==suite.sha256)throw new Error('Frozen case changed');
if(j.evaluatedAt)throw new Error('Initial observations already evaluated; preserve first evaluation');
const rendered=Object.values(j.renderBranch).every(Boolean);
function visibleFeature(o,id,predicate){const t=o.top6.find(t=>t.id===id);return rendered&&!!t?.matchedFeatures.some(f=>f.sourceUrl&&predicate(f));}
for(const o of j.observations){
 const c=o.frozenCase,checks=[],top3=o.top6.slice(0,3);const add=(name,passed,detail,type='runtime')=>checks.push({name,passed,detail,type});
 if(c.expectEmpty)add('expected empty',o.total===0,'total='+o.total);
 if(c.primaryAnyTop3)add('appropriate frozen candidate in top 3',top3.some(t=>c.primaryAnyTop3.includes(t.id)),'expected any='+c.primaryAnyTop3.join(', '));
 const ids=c.forbiddenIds||c.forbiddenIdsTop6||[],cats=c.forbiddenCategories||c.forbiddenCategoriesTop6||[],kinds=c.forbiddenKindsTop6||[];
 if(ids.length)add('explicit tool exclusions absent from displayed top 6',!o.top6.some(t=>ids.includes(t.id)),ids.join(', '));
 if(cats.length)add('explicit category exclusions absent from displayed top 6',!o.top6.some(t=>cats.includes(t.category)),cats.join(', '));
 if(kinds.length)add('explicit kind exclusions absent from displayed top 6',!o.top6.some(t=>kinds.includes(t.kind)),kinds.join(', '));
 if(c.allResultsWithinOwned)add('all results within synthetic owned fixture',o.allResults.every(t=>c.options.owned.includes(t.id)),c.options.owned.join(', '));
 if(c.options.free)add('free filter remains applied',o.top6.every(t=>t.pricing.includes('무료')),'Current product pricing label; not requested feature entitlement.');
 if(c.options.korean)add('Korean label filter remains applied',o.top6.every(t=>t.korean==='지원'),'Strict catalog label.');
 if(c.mustNotInferExcludedCategories)add('positive image context is not an exclusion',!o.meaning.exclusions.some(e=>e.type==='category'&&c.mustNotInferExcludedCategories.includes(e.value)),JSON.stringify(o.meaning.exclusions));
 if(o.id==='C5'){
  const absent=!o.top6.some(t=>t.id==='slack');
  const warning=visibleFeature(o,'slack',f=>f.name==='허들'&&/그룹 허들/.test(f.condition)&&/유료/.test(f.condition));
  add('group huddles conflict excluded or specific condition linked to render branch',absent||warning,absent?'Slack absent.':'Actual matchedFeatures contains 허들, paid-group condition, official URL; Recommend maps these exact fields. Source observation, not actual UI.', 'runtime + source inspection');
 }
 if(o.id==='H13'){
  const absent=!o.top6.some(t=>t.id==='vercel');
  const warning=visibleFeature(o,'vercel',f=>/Hobby/.test(f.name)&&/비상업용/.test(f.condition));
  add('commercial free-hosting conflict is not assumed supported',o.total===0||(!absent&&warning),'Observed '+o.total+' results. Empty is explicitly accepted by frozen H13; it does not prove semantic understanding of commercial restrictions.','runtime + source inspection');
 }
 if(o.id==='H14'){
  const absent=!o.top6.some(t=>t.id==='zapier');
  const warning=visibleFeature(o,'zapier',f=>/다단계/.test(f.name)&&/2단계/.test(f.condition));
  add('Zapier two-step free condition linked to render branch',absent||warning,'Actual matchedFeatures includes 다단계 워크플로 with free 2-step limit and official pricing URL.','runtime + source inspection');
  add('other candidates explicitly qualify unverified four-step free requirement',o.total===0,'FAIL: Make, Gemini Flash, Vercel, Copilot and Figma are also shown; none of their matched conditions or the captured rendering source specifically marks the requested four-step free workflow as unverified. Generic per-feature checks and general no-guarantee copy do not satisfy frozen H14.','agent judgement of fixed criterion + source inspection');
 }
 if(o.id==='H15')add('offline and device-local requirement explicitly unverified or empty',o.total===0,'FAIL: six candidates; no returned condition or captured SearchMeaning/Recommend branch identifies offline/device-local support as unverified. This is omission, not a claim that all external tools lack offline capability.','agent judgement of fixed criterion + source inspection');
 if(o.id==='H16')add('unregistered booking purpose unavailable or explicitly unverified',o.total===0,'FAIL: Make is returned for 예약 실행 (scheduled scenario execution); no captured branch says bicycle-repair appointment confirmation is unregistered or unverified.','agent judgement of fixed criterion + source inspection');
 o.checks=checks;o.verdict=checks.every(c=>c.passed)?'PASS':'FAIL';
 o.scopeRisks=o.allResults.filter(t=>ids.includes(t.id)||cats.includes(t.category)||kinds.includes(t.kind)).map(t=>({id:t.id,name:t.name,rank:o.allResults.indexOf(t)+1,displayedTop6:o.top6.some(x=>x.id===t.id)}));
}
j.evaluatedAt=new Date().toISOString();
j.summary={total:j.observations.length,pass:j.observations.filter(o=>o.verdict==='PASS').length,fail:j.observations.filter(o=>o.verdict==='FAIL').length,suites:j.frozenSuites.map(s=>{const a=j.observations.filter(o=>o.suite===s.suite);return{suite:s.suite,total:a.length,pass:a.filter(o=>o.verdict==='PASS').length,fail:a.filter(o=>o.verdict==='FAIL').length};})};
j.evaluationScope='Fixed minimal relevance criteria. C5 and feature-condition checks are runtime returned-data plus source-rendering-path inspection, not browser or actual UI verification. Frozen cases and V10 runner unchanged.';
fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');
console.log(JSON.stringify({summary:j.summary,failed:j.observations.filter(o=>o.verdict==='FAIL').map(o=>({id:o.id,failedChecks:o.checks.filter(c=>!c.passed)})),scopeRisks:j.observations.filter(o=>o.scopeRisks.length).map(o=>({id:o.id,risks:o.scopeRisks}))},null,2));
