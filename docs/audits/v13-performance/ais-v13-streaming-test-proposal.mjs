/**
 * Read-only Home RSC streaming regression proposal.
 * Run: node --conditions=react-server /private/tmp/ais-v13-streaming-test-proposal.mjs
 * Real Home/Link/catalog/content/billing/db source and real SQLite migrations.
 * ToolUI/Icons are registered RSC client references; their implementation,
 * hydration, browser layout and production latency are outside this test.
 * D1 is an in-memory database behind an explicitly deferred read.
 * No Site, production data, external network or vendor files are written.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';

process.env.NODE_ENV='production';
const root='/Users/bigmac_moon/dev/ai_score/site';
const require=createRequire(path.join(root,'package.json'));
const ts=require('typescript');
const React=require('react');
const {renderToReadableStream,registerClientReference}=require('react-server-dom-webpack/server.node');
assert.equal(React.version,'19.2.6');
assert.equal(typeof renderToReadableStream,'function');
assert.equal(typeof registerClientReference,'function');
const digest=text=>createHash('sha256').update(text).digest('hex');
const initialHome=fs.readFileSync(path.join(root,'app/page.tsx'),'utf8');
console.log(JSON.stringify({method:'dependency/stream-order check, not a latency budget',node:process.version,react:React.version,homeSHA256:digest(initialHome),clientBoundaryModules:['components/ToolUI','components/Icons']}));

function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
function watchdog(promise,label){let timer;const guard=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Harness watchdog: '+label+' did not settle; this is not a performance threshold')),5000);});return Promise.race([promise,guard]).finally(()=>clearTimeout(timer));}
const eventTurn=()=>new Promise(resolve=>setImmediate(resolve));
function setup(){
 const sql=new DatabaseSync(':memory:');
 for(const file of fs.readdirSync(path.join(root,'drizzle')).filter(n=>n.endsWith('.sql')).sort())sql.exec(fs.readFileSync(path.join(root,'drizzle',file),'utf8'));
 const gate=deferred(),queryStarted=deferred(),queries=[],manifest={},cache=new Map(),sourceHashes={};
 let released=false;
 const D1={prepare(query){
  assert.match(query,/^\s*SELECT\b/i,'Home fixture permits read-only SQL after seeding');
  const statement=(params=[])=>({bind(...args){return statement(args);},async all(){queries.push({query,params});assert.match(query,/\bFROM\s+posts\b/i,'Expected community data dependency');queryStarted.resolve();await gate.promise;return {results:sql.prepare(query).all(...params)};},async first(){queryStarted.resolve();await gate.promise;return sql.prepare(query).get(...params)||null;}});
  return statement();
 }};
 const clientModules=new Map();
 function clientModule(moduleName){
  if(clientModules.has(moduleName))return clientModules.get(moduleName);
  const exports={};const proxy=new Proxy(exports,{get(target,name){
   if(name==='__esModule')return true;
   if(typeof name!=='string')return undefined;
   if(!target[name]){const id='fixture-client:'+moduleName;manifest[id+'#'+name]={id,chunks:[],name,async:false};target[name]=registerClientReference(function(){throw new Error('Client implementation must not execute in RSC fixture');},id,name);}
   return target[name];
  }});clientModules.set(moduleName,proxy);return proxy;
 }
 function resolveLocal(name){
  const base=path.isAbsolute(name)?name:path.join(root,name);
  for(const file of [base,base+'.ts',base+'.tsx',base+'.json',path.join(base,'index.ts'),path.join(base,'index.tsx')])if(fs.existsSync(file)&&fs.statSync(file).isFile())return file;
  throw new Error('Unresolved actual module: '+name);
 }
 function load(name){
  const file=resolveLocal(name);
  if(cache.has(file))return cache.get(file).exports;
  const source=fs.readFileSync(file,'utf8');sourceHashes[path.relative(root,file)]=digest(source);
  if(file.endsWith('.json'))return JSON.parse(source);
  const module={exports:{}};cache.set(file,module);
  const localRequire=name=>{
   if(name==='cloudflare:workers')return {env:{DB:D1}};
   if(name==='@/components/ToolUI'||name==='@/components/Icons')return clientModule(name.slice(2));
   if(name.startsWith('@/'))return load(name.slice(2));
   if(name.startsWith('.'))return load(path.resolve(path.dirname(file),name));
   return require(name);
  };
  const output=ts.transpileModule(source,{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInNewContext(output,{exports:module.exports,module,require:localRequire,Date,Intl,URL,TextEncoder,TextDecoder,Uint8Array,crypto,console,AbortController,ReadableStream,setTimeout,clearTimeout,fetch:()=>{throw new Error('External network is forbidden in this fixture');}},{filename:file});
  return module.exports;
 }
 function seed({id,title,status='published',parent=null,created='2026-09-12T10:00:00.000Z',kind='discussion'}){
  sql.prepare('INSERT INTO posts(id,user_id,author,kind,parent_id,title,body,affiliation,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id,'fixture-owner','V13 local fixture',kind,parent,title,'Synthetic in-memory fixture only','none',status,created,created);
 }
 return {sql,gate,queryStarted,queries,manifest,sourceHashes,load,seed,release(error){if(released)return;released=true;if(error)gate.reject(error);else gate.resolve();},close(){sql.close();}};
}

async function observe(fixture,{failure=false}={}){
 const errors=[],abort=new AbortController();
 const Home=fixture.load('app/page.tsx').default;
 const stream=await renderToReadableStream(React.createElement(Home),fixture.manifest,{signal:abort.signal,onError:error=>{errors.push(String(error));return 'fixture-render-error';}});
 const reader=stream.getReader(),decoder=new TextDecoder();let output='';
 const pump=(async()=>{while(true){const chunk=await reader.read();if(chunk.done)break;output+=decoder.decode(chunk.value,{stream:true});}output+=decoder.decode();})();
 // Handle premature rejection while the synchronization watchdog is pending.
 pump.catch(()=>{});
 try{
  await watchdog(fixture.queryStarted.promise,'D1 read entry');
  // Give the actual RSC scheduler several event-loop turns, with D1 still
  // unresolved. No elapsed-time result is reported or compared as site speed.
  for(let i=0;i<6;i++)await eventTurn();
  const before=output;
  fixture.release(failure?new Error('Controlled D1 failure; fixture only'):undefined);
  await watchdog(pump,'RSC completion after explicit D1 release');
  return {before,after:output,errors,queries:fixture.queries,sourceHashes:fixture.sourceHashes};
 }finally{
  fixture.release();abort.abort();try{await reader.cancel();}catch{}fixture.close();
 }
}

test('Home hero and search shell stream while recent published posts remain pending; post follows release',async()=>{
 const f=setup();f.seed({id:'stream-public-later',title:'V13_STREAM_REAL_PUBLIC_AFTER_RELEASE'});
 const r=await observe(f);
 const checks={heroBefore:r.before.includes('일에 맞는 도구를 찾고,'),formBefore:r.before.includes('"action":"/search"'),quickSearchBefore:r.before.includes('/search?q='+encodeURIComponent('보고서 작성')),postBefore:r.before.includes('V13_STREAM_REAL_PUBLIC_AFTER_RELEASE'),postAfter:r.after.includes('V13_STREAM_REAL_PUBLIC_AFTER_RELEASE')};
 console.log(JSON.stringify({case:'pending community dependency',...checks,homeSHA256:r.sourceHashes['app/page.tsx'],queryCount:r.queries.length}));
 assert.deepEqual(r.errors,[],'RSC must serialize actual source successfully');
 assert.equal(checks.postBefore,false,'No unfinished database row may appear before resolution');
 assert.equal(checks.postAfter,true,'The real published row must arrive after D1 release');
 assert.equal(checks.heroBefore,true,'RED dependency: Home hero is blocked by the pending recent-posts D1 read');
 assert.equal(checks.formBefore,true,'Search form action must be available before recent posts resolve');
 assert.equal(checks.quickSearchBefore,true,'Actual Link quick search href must be available before recent posts resolve');
});

test('real Home SQL keeps newest three published top-level posts and excludes hidden/deleted/reply rows',async()=>{
 const f=setup();
 for(const [id,title,created] of [['public-oldest','V13_EXCLUDED_FOURTH','2026-09-12T09:00:00.000Z'],['public-third','V13_PUBLIC_THIRD','2026-09-12T10:00:00.000Z'],['public-second','V13_PUBLIC_SECOND','2026-09-12T11:00:00.000Z'],['public-first','V13_PUBLIC_FIRST','2026-09-12T12:00:00.000Z']])f.seed({id,title,created});
 f.seed({id:'hidden',title:'V13_EXCLUDED_HIDDEN',status:'hidden',created:'2026-09-13T00:00:00.000Z'});
 f.seed({id:'deleted',title:'V13_EXCLUDED_DELETED',status:'deleted',created:'2026-09-13T00:00:00.000Z'});
 f.seed({id:'draft',title:'V13_EXCLUDED_DRAFT',status:'draft',created:'2026-09-13T00:00:00.000Z'});
 f.seed({id:'reply',title:'V13_EXCLUDED_REPLY',parent:'public-first',kind:'reply',created:'2026-09-13T00:00:00.000Z'});
 const r=await observe(f);assert.deepEqual(r.errors,[]);
 for(const title of ['V13_PUBLIC_FIRST','V13_PUBLIC_SECOND','V13_PUBLIC_THIRD'])assert.ok(r.after.includes(title),title);
 for(const title of ['V13_EXCLUDED_FOURTH','V13_EXCLUDED_HIDDEN','V13_EXCLUDED_DELETED','V13_EXCLUDED_DRAFT','V13_EXCLUDED_REPLY'])assert.equal(r.after.includes(title),false,title);
 assert.ok(r.after.indexOf('V13_PUBLIC_FIRST')<r.after.indexOf('V13_PUBLIC_SECOND'));
 assert.ok(r.after.indexOf('V13_PUBLIC_SECOND')<r.after.indexOf('V13_PUBLIC_THIRD'));
 assert.ok(r.after.includes('/community/public-first'),'Actual Link resolves to the real returned post');
});

test('empty community returns truthful invitation without a fabricated published post',async()=>{
 const r=await observe(setup());assert.deepEqual(r.errors,[]);
 assert.ok(r.after.includes('첫 사용 경험을 남겨보세요.'));
 assert.ok(r.after.includes('경험 나누기'));
 assert.equal(r.after.includes('지금은 최근 글을 불러오지 못했습니다.'),false);
 assert.equal(r.after.includes('V13_PUBLIC_'),false);
});

test('D1 failure keeps shell and explicit unavailable state, distinct from no published posts',async()=>{
 const r=await observe(setup(),{failure:true});assert.deepEqual(r.errors,[],'Home handles expected community failure');
 assert.ok(r.after.includes('일에 맞는 도구를 찾고,'));
 assert.ok(r.after.includes('지금은 최근 글을 불러오지 못했습니다.'));
 assert.equal(r.after.includes('첫 사용 경험을 남겨보세요.'),false);
 assert.ok(r.after.includes('"href":"/community"'));
});
