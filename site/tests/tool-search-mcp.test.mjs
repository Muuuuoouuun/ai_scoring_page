import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {harness} from './api-harness.mjs';
function registeredTools(){
 const h=harness(),registered=[],applied=[];
 const source=fs.readFileSync(new URL('../components/useToolSearchMCP.ts',import.meta.url),'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 vm.runInNewContext(code,{exports:module.exports,module,AbortController,document:{modelContext:{registerTool(tool){registered.push(tool);}}},require(name){
  if(name==='react')return {useEffect:effect=>effect()};
  if(name==='react-dom')return {flushSync:callback=>callback()};
  return h.load(name.replace('@/','')+'.ts');
 }});
 module.exports.useToolSearchMCP(input=>applied.push(input));
 return {registered,applied,catalog:h.load('lib/catalog.ts')};
}
test('MCP multi-genre search returns the same secondary-purpose results as the UI and updates its filters',()=>{
 const {registered,applied,catalog}=registeredTools(),search=registered.find(t=>t.name==='search_tools');
 assert.ok(search.inputSchema.properties.genre.enum.includes('image'));
 const result=search.execute({query:'',genre:'image'});
 assert.deepEqual(Array.from(result.tools,t=>t.id),Array.from(catalog.searchCatalog('',{genre:'image'}),t=>t.id));
 assert.equal(applied[0].genre,'image');assert.equal(applied[0].category,'all');
 assert.ok(result.count>search.execute({query:'',category:'image'}).count);
});
test('MCP rejects unknown genres before changing filters and detail reading exposes current update provenance',()=>{
 const {registered,applied}=registeredTools();
 assert.throws(()=>registered.find(t=>t.name==='search_tools').execute({query:'',genre:'unknown'}));
 assert.equal(applied.length,0);
 const details=registered.find(t=>t.name==='read_tool_details').execute({id:'chatgpt'});
 assert.ok(details.genres.includes('image'));assert.equal(details.latestUpdate.checkedAt,'2026-10-22');
 assert.ok(details.features.every(f=>f.checkedAt));
});
