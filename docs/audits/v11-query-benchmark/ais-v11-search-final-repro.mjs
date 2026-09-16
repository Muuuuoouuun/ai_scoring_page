import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {harness} from '/Users/bigmac_moon/dev/ai_score/site/tests/api-harness.mjs';
const base='/Users/bigmac_moon/dev/ai_score/site/';
const files=['lib/catalog-search.ts','lib/catalog.ts','components/Recommend.tsx','components/SearchMeaning.tsx','components/Explore.tsx','app/api/search/route.ts'];
const hashes=()=>Object.fromEntries(files.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(base+p)).digest('hex')]));
const before=hashes(),h=harness(),c=h.load('lib/catalog.ts');
const queries=[
 '보고서 작성, 광고는 제외하고',
 'Notion으로 문서를 쓰되 광고는 제외하고',
 'Notion과 광고를 제외하고 문서 작성',
 '바코드 도구는 제외하고 문서 작성',
 '그림자는 빼고 보고서 작성',
 'Notion은 제외하지 말고 문서 작성',
 '모델을 제외하지 말고 코딩',
 '무료가 아닌 이미지 생성',
 '무료가 아니어도 이미지 생성',
 '코딩뿐만 아니라 문서도',
 'Notion과 Slack은 제외하고 협업',
 '이미지 생성이 아닌 보고서 작성',
 'Notion 없이 보고서 작성',
 '보고서 작성','이미지 생성','art',
];
const observations=queries.map(query=>{const all=c.searchCatalog(query);return {query,meaning:c.interpretCatalogQuery(query),count:all.length,top6:all.slice(0,6).map(t=>({id:t.id,relevance:t.relevance,matchedFeatures:t.matchedFeatures.map(f=>({name:f.name,description:f.description,status:f.status,condition:f.condition,sourceUrl:f.sourceUrl}))}))};});
const filters=[];
for(const q of ['','코딩','이미지 생성','보고서 작성']){
 const all=c.searchCatalog(q);const ids=new Set(all.map(t=>t.id));
 for(const options of [{category:'image'},{kind:'model'},{free:true},{korean:true},{owned:[]},{owned:['notion','chatgpt','unknown-id']},{category:'image',kind:'model'}]){
  const list=c.searchCatalog(q,options);
  assert.ok(list.every(t=>ids.has(t.id)));
  assert.ok(list.every(t=>(!options.category||t.category===options.category)&&(!options.kind||t.kind===options.kind)&&(!options.free||t.pricing.includes('무료'))&&(!options.korean||t.korean==='지원')&&(!options.owned||options.owned.includes(t.id))));
  filters.push({q,options,count:list.length,subsetAndConstraints:true});
 }
}
const search=h.load('app/api/search/route.ts'),api=[];
for(const [q,type] of [['%','all'],['','all'],['Notion','tool'],['ChatGPT','all'],['양자중력 실험장비 원격 교정','all'],['x'.repeat(161),'all'],['Notion','invalid']]){
 const r=await search.GET(new Request('https://example.invalid/api/search?q='+encodeURIComponent(q)+'&type='+type)),d=await r.json();
 const expected=(q.length>160||type==='invalid')?400:200;
 assert.equal(r.status,expected);
 if(r.status===200){assert.deepEqual(Object.keys(d).sort(),['counts','partial','results','total']);assert.equal(d.partial,false);assert.equal(d.total,Object.values(d.counts).reduce((s,n)=>s+n,0));if(type==='tool')assert.ok(d.results.every(x=>x.type==='tool'));if(['%','','양자중력 실험장비 원격 교정'].includes(q))assert.equal(d.results.length,0);}
 api.push({query:q.length>160?'161 characters':q,type,status:r.status,result:r.status===200?{count:d.results.length,total:d.total,counts:d.counts,partial:d.partial}:d});
}
const allBefore=JSON.stringify(c.catalog),options={owned:['notion','chatgpt']},optionBefore=JSON.stringify(options);
c.searchCatalog('보고서 작성',options);assert.equal(JSON.stringify(c.catalog),allBefore);assert.equal(JSON.stringify(options),optionBefore);
const after=hashes();assert.deepEqual(after,before);
const result={checkedAt:new Date().toISOString(),scope:'actual TypeScript modules; memory SQLite API; no browser/network/Site edits',sourceHashes:before,sourceUnchangedDuringRun:true,observations,filterChecks:filters,apiChecks:api,catalogAndOptionsUnchanged:true};
fs.writeFileSync('/private/tmp/ais-v11-search-final-repro.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({checkedAt:result.checkedAt,sourceUnchangedDuringRun:true,observations:observations.map(o=>({query:o.query,meaning:o.meaning,count:o.count,top6:o.top6.map(t=>t.id)})),filterChecks:filters.length,apiChecks:api.length},null,2));
h.sql.close();
