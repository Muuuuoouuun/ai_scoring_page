import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {harness} from './api-harness.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const api=harness(),{catalog,searchCatalog}=api.load('lib/catalog.ts');
const empty=()=>null;

// Render the real wording and query interpretation against the real catalog.
// Supply a task query through its initial state and suppress network effects.
function render(component,{query='',props={}}={}){
  const cache=new Map();
  const hooks={useState:initial=>[initial==='보고서 작성'?query:initial,empty],useEffect:empty,useCallback:callback=>callback};
  function load(name){
    if(cache.has(name))return cache.get(name);
    const loaded={exports:{}};
    const output=ts.transpileModule(fs.readFileSync(path.join(root,'components',name+'.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
    const localRequire=name=>{
      if(name==='react')return {...React,...hooks};
      if(name==='./Provider')return {useApp:()=>({user:null}),api:()=>assert.fail('Static public recommendation must not request account data')};
      if(name==='./ToolUI')return {ToolCard:({tool})=>React.createElement('article',{'data-tool':tool.id},tool.name)};
      if(name==='./Icons')return {ArrowUpRight:empty,ArrowRight:empty,Search:empty};
      if(name==='./useToolSearchMCP')return {useToolSearchMCP:empty};
      if(name==='./SimilarRecommendations')return {__esModule:true,default:empty};
      if(name==='@/components/Link')return {__esModule:true,default:props=>React.createElement('a',props)};
      if(name.startsWith('./'))return load(name.slice(2));
      if(name.startsWith('@/'))return api.load(name.slice(2));
      return require(name);
    };
    vm.runInNewContext(output,{module:loaded,exports:loaded.exports,require:localRequire});
    cache.set(name,loaded.exports);
    return loaded.exports;
  }
  return renderToStaticMarkup(React.createElement(load(component).default,props));
}

test('a free trial recommendation quotes its limited access rather than promising a free plan',()=>{
  const tool=catalog.find(tool=>tool.id==='runway');
  const markup=render('Recommend',{query:'무료 Runway'});
  assert.match(markup,/data-tool="runway"/);
  assert.ok(markup.includes('무료 이용 범위: '+tool.pricing));
  assert.doesNotMatch(markup,/무료 플랜이 있는 서비스입니다/);
});

test('a service with a recorded free plan keeps that pricing in its recommendation explanation',()=>{
  const tool=catalog.find(tool=>tool.id==='chatgpt');
  const markup=render('Recommend',{query:'무료 ChatGPT'});
  assert.match(markup,/data-tool="chatgpt"/);
  assert.ok(markup.includes('무료 이용 범위: '+tool.pricing));
});

test('exploration and recommendation controls describe free access including trials',()=>{
  const explore=render('Explore',{props:{initialQuery:'무료 Runway'}});
  const recommend=render('Recommend',{query:'무료 Runway'});
  assert.match(explore,/무료 이용 가능<\/label>/);
  assert.match(recommend,/무료 이용 필요<\/label>/);
  assert.doesNotMatch(explore,/무료 플랜 있음<\/label>/);
  assert.doesNotMatch(recommend,/무료 플랜 필요<\/label>/);
});

test('the interpreted free query explains trial and plan limits without certifying feature access',()=>{
  const markup=render('SearchMeaning',{props:{query:'무료 Runway'}});
  assert.match(markup,/무료 이용 범위가 있는 서비스/);
  assert.match(markup,/플랜·체험/);
  assert.doesNotMatch(markup,/무료 플랜이 있는 서비스/);
});

test('free access filtering retains both a trial and a free plan while uncertain requirements stay uncertain',()=>{
  const results=searchCatalog('',{free:true});
  assert.ok(results.some(tool=>tool.id==='runway'));
  assert.ok(results.some(tool=>tool.id==='chatgpt'));
  assert.ok(!results.some(tool=>tool.id==='midjourney'));
  const constrained=searchCatalog('무료로 네 단계 자동화',{free:true});
  assert.ok(constrained.length);
  assert.ok(constrained.every(tool=>tool.unverifiedRequirements.includes('네 단계 처리의 무료 이용 범위')));
  assert.ok(constrained.every(tool=>!tool.unverifiedRequirements.some(requirement=>requirement.includes('무료 플랜 이용 범위'))));
});
