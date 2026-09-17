const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {createRequire}=require('node:module');
const site='/Users/bigmac_moon/dev/ai_score/site',tmp='/private/tmp',prefix='ais-v11-relevance-final-regression';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const outputPath=path.join(tmp,prefix+'.json');
if(fs.existsSync(outputPath))throw new Error('Preserve existing final-regression observation');
const protectedFiles=['ais-v10-purpose-query-cases.json','ais-v10-purpose-query-runner.cjs','ais-v11-relevance-holdout-cases.json','ais-v11-relevance-initial-observations.json','ais-v11-relevance-initial-observations.md'];
const protectedBefore=Object.fromEntries(protectedFiles.map(p=>[p,hash(fs.readFileSync(path.join(tmp,p)))]));
const sourcePaths=['lib/catalog.ts','lib/catalog-search.ts','data/catalog.json','components/Recommend.tsx','components/ToolUI.tsx','components/SearchMeaning.tsx'];
const snapshots=Object.fromEntries(sourcePaths.map(p=>[p,fs.readFileSync(path.join(site,p),'utf8')]));
const sourceHashes=Object.fromEntries(sourcePaths.map(p=>[p,hash(snapshots[p])]));
const sourcesAt=new Date().toISOString();
const suites=[
 {id:'v10-frozen-20',file:'ais-v10-purpose-query-cases.json',expectedHash:'322fb90697148e6b77a53e8de2ca720f4cfd3041433bfb882113aacca294bd9c'},
 {id:'v11-public-regression-16',file:'ais-v11-relevance-holdout-cases.json',expectedHash:'d0103236ed0b9f064c5fefa919034f777926ddbb952b40e2e79d973b05e9ce64'}
];
for(const s of suites){const b=fs.readFileSync(path.join(tmp,s.file));if(hash(b)!==s.expectedHash)throw new Error('Frozen cases changed: '+s.file);s.cases=JSON.parse(b).cases;}
const ts=createRequire(path.join(site,'package.json'))('typescript'),cache=new Map();
function load(rel){
 let file=path.posix.normalize(rel);if(!path.extname(file))file+='.ts';
 if(!(file in snapshots))throw new Error('Non-snapshot module forbidden: '+file);
 if(file.endsWith('.json'))return JSON.parse(snapshots[file]);
 if(cache.has(file))return cache.get(file).exports;
 const m={exports:{}};cache.set(file,m);
 const code=ts.transpileModule(snapshots[file],{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const localRequire=id=>id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.posix.join(path.posix.dirname(file),id)):(()=>{throw new Error('External runtime module forbidden: '+id);})();
 const context=vm.createContext({module:m,exports:m.exports,require:localRequire},{codeGeneration:{strings:false,wasm:false}});
 new vm.Script(code,{filename:file+' (in-memory TypeScript transform)'}).runInContext(context,{timeout:1000});
 return m.exports;
}
const {searchCatalog,interpretCatalogQuery}=load('lib/catalog.ts'),recommend=snapshots['components/Recommend.tsx'];
const renderBranch={matchedFeatures:recommend.includes('t.matchedFeatures.map(f=>'),condition:recommend.includes("{f.condition||'추가 이용 조건은 공식 문서를 확인하세요.'}"),sourceUrl:recommend.includes('href={f.sourceUrl}'),status:recommend.includes("f.status==='conditional'?'조건부 지원':'확인 필요'"),unverifiedRequirements:recommend.includes("t.unverifiedRequirements.join(' · ')")&&recommend.includes('요구 조건 확인 필요')&&recommend.includes('등록 근거만으로는 충족 여부를 확인하지 못했습니다.')};
const observations=suites.flatMap(s=>s.cases.map(c=>{
 const meaning=interpretCatalogQuery(c.query),all=searchCatalog(c.query,c.options);
 return {suite:s.id,id:c.id,domain:c.domain,query:c.query,options:c.options,expectation:c.expectation,meaning,total:all.length,
 allResults:all.map(t=>({id:t.id,name:t.name,category:t.category,kind:t.kind,relevance:t.relevance,pricing:t.pricing,korean:t.korean,unverifiedRequirements:t.unverifiedRequirements})),
 top6:all.slice(0,6).map(t=>({id:t.id,name:t.name,category:t.category,kind:t.kind,relevance:t.relevance,pricing:t.pricing,korean:t.korean,matchedFeatures:t.matchedFeatures,matchedUseCases:t.matchedUseCases,unverifiedRequirements:t.unverifiedRequirements})),frozenCase:c};
}));
const afterHashes=Object.fromEntries(sourcePaths.map(p=>[p,hash(fs.readFileSync(path.join(site,p)))]));
const protectedAfter=Object.fromEntries(protectedFiles.map(p=>[p,hash(fs.readFileSync(path.join(tmp,p)))]));
const out={observedAt:new Date().toISOString(),sourcesAt,node:process.version,typescript:ts.version,method:'Current module source snapshots recursively transpiled in memory; actual searchCatalog/interpretCatalogQuery; no browser, network, database, account or production-data calls. Previously disclosed 16 are regression cases, not fresh holdout.',frozenSuites:suites.map(s=>({suite:s.id,path:path.join(tmp,s.file),sha256:s.expectedHash,count:s.cases.length})),sourceHashes,sourceHashesAfter:afterHashes,sourceFilesUnchangedDuringRun:JSON.stringify(sourceHashes)===JSON.stringify(afterHashes),protectedFilesBefore:protectedBefore,protectedFilesAfter:protectedAfter,protectedFilesUnchanged:JSON.stringify(protectedBefore)===JSON.stringify(protectedAfter),renderBranch,observations};
fs.writeFileSync(outputPath,JSON.stringify(out,null,2)+'\n');
fs.writeFileSync(path.join(tmp,prefix+'-source-snapshot.json'),JSON.stringify({sourcesAt,sourceHashes,snapshots},null,2)+'\n');
console.log(JSON.stringify({sourcesAt,sourceUnchanged:out.sourceFilesUnchangedDuringRun,protectedUnchanged:out.protectedFilesUnchanged,renderBranch,rows:observations.map(o=>({id:o.id,top6:o.top6.map(t=>t.name),requirements:o.meaning.requirements,unverified:o.top6[0]?.unverifiedRequirements,exclusions:o.meaning.exclusions}))},null,2));
