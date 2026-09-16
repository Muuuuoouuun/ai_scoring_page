import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {harness} from './api-harness.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(path.join(root,'package.json'));
const ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const empty=()=>null;
function insights(h){
 const module={exports:{}};
 const localRequire=s=>s==='./ToolUI'?{ToolLogo:empty}:s==='./Icons'?{ArrowUpRight:empty,Plus:empty}:s.startsWith('@/')?h.load(s.slice(2)):require(s);
 const output=ts.transpileModule(fs.readFileSync(path.join(root,'components/ServiceInsights.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(output,{exports:module.exports,module,require:localRequire});
 return module.exports.default;
}

test('saved eligibility choices survive reload into the personal service benefits display',async()=>{
 const h=harness(undefined,{now:()=> '2026-09-15T12:00:00Z'}),Component=insights(h);
 const p=h.load('data/promotions.json').find(p=>p.id==='notion-individual-education');
 const token=h.load('lib/promotion-facts.ts').eligibilityFingerprint(p);
 assert.equal((await h.save('library',{name:'Notion',toolId:'notion',status:'using'})).status,200);
 for(const [choice,version,label] of [
  ['unknown','','조건 확인 필요'],
  ['ineligible','','내 설정: 해당하지 않음'],
  ['eligible',token,'입력 조건 일치']
 ]){
  const saved=await h.save('settings',{interests:['notion'],includeAlternatives:false,inApp:true,email:false,promotionEligibility:{[p.id]:choice},promotionEligibilityVersions:{[p.id]:version}});
  assert.equal(saved.status,200);
  const {records}= (await h.call(h.workspace.GET,null,'GET')).data;
  const markup=renderToStaticMarkup(React.createElement(Component,{records,onEdit:empty,onAddSubscription:empty}));
  const article=markup.match(new RegExp('<article><div><a href="/promotions#'+p.id+'"[\\s\\S]*?</article>'))?.[0];
  assert.ok(article,choice);
  assert.ok(article.includes('>'+label+'</span>'),choice+' must preserve its saved meaning');
 }
});
