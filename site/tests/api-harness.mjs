import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(path.join(root,'package.json')),ts=require('typescript');
export function harness(fetcher=()=>{throw new Error("External calls forbidden in tests");},options={}){
 const Clock=options.now?class extends Date{constructor(...args){super(...(args.length?args:[options.now()]));}static now(){return new Date(options.now()).getTime();}}:Date;
 const sql=new DatabaseSync(':memory:');for(const file of fs.readdirSync(path.join(root,'drizzle')).filter(n=>n.endsWith('.sql')).sort())sql.exec(fs.readFileSync(path.join(root,'drizzle',file),'utf8'));
 let user={userId:'alpha',email:'alpha@example.invalid',fullName:'Alpha'};
 const D1={prepare(q){return {bind(...p){return make(q,p);},...make(q,[])}} ,async batch(statements){sql.exec('BEGIN');try{const results=[];for(const s of statements)results.push(s.runSync());sql.exec('COMMIT');return results;}catch(e){sql.exec('ROLLBACK');throw e;}}};
 function make(q,p){return {bind(...values){return make(q,values);},async first(){return sql.prepare(q).get(...p)||null;},async all(){return {results:sql.prepare(q).all(...p)};},runSync(){const result=sql.prepare(q).run(...p);return {meta:{changes:Number(result.changes)}};},async run(){return this.runSync();}};}
 const env={DB:D1,RESEND_API_KEY:'TEST_ONLY',EMAIL_FROM:'test@example.invalid',SITE_URL:'https://example.invalid'};
 const cache=new Map();function load(name){let file=path.isAbsolute(name)?name:path.join(root,name);if(!path.extname(file))file+='.ts';if(file.endsWith('.json'))return options.jsonFixtures?.[path.relative(root,file)]??JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);const localRequire=s=>s==='cloudflare:workers'?{env,waitUntil:()=>{}}:s==='@/app/chatgpt-auth'?{getChatGPTUser:async()=>user}:s.startsWith('@/')?load(s.slice(2)):s.startsWith('.')?load(path.resolve(path.dirname(file),s)):require(s);const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;vm.runInNewContext(output,{exports:m.exports,module:m,require:localRequire,Response,Request,Date:Clock,URL,Headers,AbortSignal,TextEncoder,TextDecoder,Uint8Array,crypto,console,fetch:fetcher},{filename:file});return m.exports;}
 const workspace=load('app/api/workspace/route.ts'),community=load('app/api/community/route.ts'),notices=load('app/api/notifications/route.ts'),scores=load('app/api/scores/route.ts');
 async function call(handler,body,method='POST',headers={}){const response=await handler(new Request('https://example.invalid/api/test',{method,headers:{'Content-Type':'application/json','Origin':'https://example.invalid',...headers},...method!=='GET'?{body:JSON.stringify(body)}:{}}));return {status:response.status,data:await response.json()};}
 async function guard(kind,payload,id){
  if(kind==='settings'){const list=await call(workspace.GET,null,'GET');const saved=list.data.records?.find(r=>r.kind==='settings');return {expectedSettingsRevision:saved?.payload.emailRevision||''};}
  let parent=kind==='subscription'?id:payload?.subscriptionId;
  if(!parent&&id){const old=sql.prepare('SELECT payload FROM private_records WHERE id=?').get(id);if(old)parent=JSON.parse(old.payload).subscriptionId;}
  const list=await call(workspace.GET,null,'GET'),r=list.data.records?.find(r=>r.id===parent)||list.data.records?.find(r=>r.kind==='subscription'&&payload?.bundleId&&r.payload.bundleId===payload.bundleId);
  return {expectedRevision:r?.payload.termsHistory?.revision??0,historyId:r?.payload.historyId};
 }
 const save=async(kind,payload,id,target)=>call(workspace.POST,{action:'save',kind,payload,id,target,...await guard(kind,payload,id)});
 const terms=async(subscriptionId,proposal,stamp)=>call(load('app/api/billing-terms/route.ts').POST,{subscriptionId,...await guard('subscription',{},subscriptionId),...proposal,...stamp});
 const record=id=>JSON.parse(sql.prepare('SELECT payload FROM private_records WHERE id=?').get(id).payload);
 return {sql,env,load,workspace,community,notices,scores,call,save,terms,guard,record,user:v=>{user=v;}};
}
