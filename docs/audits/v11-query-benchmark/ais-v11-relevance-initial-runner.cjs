const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {createRequire}=require('node:module');
const site='/Users/bigmac_moon/dev/ai_score/site',tmp='/private/tmp';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const sourcePaths=['lib/catalog.ts','lib/catalog-search.ts','data/catalog.json','components/Recommend.tsx','components/ToolUI.tsx','components/SearchMeaning.tsx'];
const snapshots=Object.fromEntries(sourcePaths.map(p=>[p,fs.readFileSync(path.join(site,p),'utf8')]));
const sourceHashes=Object.fromEntries(sourcePaths.map(p=>[p,hash(snapshots[p])]));
const sourcesAt=new Date().toISOString();
const suites=[
 {id:'v10-frozen-20',file:'ais-v10-purpose-query-cases.json',expectedHash:'322fb90697148e6b77a53e8de2ca720f4cfd3041433bfb882113aacca294bd9c'},
 {id:'v11-holdout-16',file:'ais-v11-relevance-holdout-cases.json',expectedHash:'d0103236ed0b9f064c5fefa919034f777926ddbb952b40e2e79d973b05e9ce64'}
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
const {searchCatalog,interpretCatalogQuery}=load('lib/catalog.ts');
const renderBranch={
 matchedFeatures:snapshots['components/Recommend.tsx'].includes('t.matchedFeatures.map(f=>'),
 condition:snapshots['components/Recommend.tsx'].includes("{f.condition||'추가 이용 조건은 공식 문서를 확인하세요.'}"),
 sourceUrl:snapshots['components/Recommend.tsx'].includes('href={f.sourceUrl}'),
 status:snapshots['components/Recommend.tsx'].includes("f.status==='conditional'?'조건부 지원':'확인 필요'")
};
const observations=suites.flatMap(s=>s.cases.map(c=>{
 const meaning=interpretCatalogQuery(c.query),all=searchCatalog(c.query,c.options),top6=all.slice(0,6);
 return {suite:s.id,id:c.id,domain:c.domain,query:c.query,options:c.options,expectation:c.expectation,meaning,total:all.length,
  allResults:all.map(t=>({id:t.id,name:t.name,category:t.category,kind:t.kind,relevance:t.relevance})),
  top6:top6.map(t=>({id:t.id,name:t.name,category:t.category,kind:t.kind,relevance:t.relevance,pricing:t.pricing,korean:t.korean,matchedFeatures:t.matchedFeatures,matchedUseCases:t.matchedUseCases})),
  frozenCase:c};
}));
const afterHashes=Object.fromEntries(sourcePaths.map(p=>[p,hash(fs.readFileSync(path.join(site,p)))]));
const out={observedAt:new Date().toISOString(),sourcesAt,node:process.version,typescript:ts.version,
 method:'Current source modules and catalog JSON snapshotted before invocation, recursively transpiled in memory; direct actual searchCatalog and interpretCatalogQuery. No API, browser, SQLite, account, network or production-data calls. Render branch inspected as source only.',
 frozenSuites:suites.map(s=>({suite:s.id,path:path.join(tmp,s.file),sha256:s.expectedHash,count:s.cases.length})),sourceHashes,sourceHashesAfter:afterHashes,sourceFilesUnchangedDuringRun:JSON.stringify(sourceHashes)===JSON.stringify(afterHashes),renderBranch,observations};
fs.writeFileSync(path.join(tmp,'ais-v11-relevance-initial-observations.json'),JSON.stringify(out,null,2)+'\n');
fs.writeFileSync(path.join(tmp,'ais-v11-relevance-initial-source-snapshot.json'),JSON.stringify({sourcesAt,sourceHashes,snapshots},null,2)+'\n');
console.log(JSON.stringify({sourcesAt,unchanged:out.sourceFilesUnchangedDuringRun,renderBranch,rows:observations.map(o=>({id:o.id,query:o.query,meaning:o.meaning,top6:o.top6.map(t=>t.name),features:o.top6.map(t=>({id:t.id,features:t.matchedFeatures.map(f=>f.name)}))}))},null,2));
