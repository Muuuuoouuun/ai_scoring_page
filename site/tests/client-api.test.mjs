import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
function client(fetcher){
  const module={exports:{}};
  const code=ts.transpileModule(fs.readFileSync(new URL('../components/Provider.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,require,fetch:fetcher});
  return module.exports.api;
}
test('a failed network request provides a readable recovery action and does not retry a write',async()=>{
  let calls=0;
  const api=client(async()=>{calls++;throw new TypeError('Failed to fetch');});
  await assert.rejects(()=>api('/api/community',{method:'POST',body:'{}'}),/연결 상태를 확인/);
  assert.equal(calls,1);
});
test('a server validation message is retained rather than described as a connection failure',async()=>{
  const api=client(async()=>new Response(JSON.stringify({error:'공개 동의를 확인해주세요.'}),{status:400}));
  await assert.rejects(()=>api('/api/community'),/공개 동의를 확인해주세요/);
});
test('a successful request keeps its JSON response and supplied headers',async()=>{
  let observed;
  const api=client(async(path,options)=>{observed={path,options};return new Response(JSON.stringify({id:'saved'}));});
  assert.equal((await api('/api/community',{method:'POST',headers:{'X-Test':'one'},body:'{}'})).id,'saved');
  assert.equal(observed.options.method,'POST');
  assert.equal(observed.options.headers['Content-Type'],'application/json');
  assert.equal(observed.options.headers['X-Test'],'one');
});
