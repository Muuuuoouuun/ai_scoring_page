import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const tool={id:'claude'};
const sample=(overrides={})=>{const result={axes:{quality:{value:4.2,count:5}},sample:6,ratedReviewCount:5,tasks:['문서 작성','코딩'],plans:['Free','Pro'],latest:'2026-10-02T11:20:00.000Z',usedAtRange:null,evidence:[],evidenceTotal:0,...overrides};result.axes=Object.fromEntries(Object.entries(result.axes).map(([key,axis])=>[key,{distribution:[0,0,0,axis.count,0],...axis}]));return result;};
const nodes=tree=>Array.isArray(tree)?tree.flatMap(nodes):tree&&typeof tree==='object'&&tree.props?[tree,...nodes(tree.props.children)]:[];
const text=tree=>Array.isArray(tree)?tree.map(text).join(''):tree&&typeof tree==='object'&&tree.props?text(tree.props.children):typeof tree==='string'||typeof tree==='number'?String(tree):'';

// Run the component's real render/effect logic with separately controlled commits
// and network completions. This exposes the render before a filter's effect runs.
function harness(){
  const states=[],effects=[],pending=new Map(),requests=[];
  let cursor=0,dirty=false,tree;
  const hooks={
    useState(initial){const index=cursor++;if(!(index in states))states[index]=typeof initial==='function'?initial():initial;return [states[index],next=>{const value=typeof next==='function'?next(states[index]):next;if(!Object.is(states[index],value)){states[index]=value;dirty=true;}}];},
    useEffect(effect,deps){const index=cursor++,previous=effects[index];if(!previous||deps.some((value,i)=>!Object.is(value,previous.deps[i])))pending.set(index,{effect,deps});},
  };
  const api=path=>new Promise((resolve,reject)=>requests.push({path,resolve,reject}));
  const loaded={exports:{}};
  const source=fs.readFileSync(new URL('../components/ToolReviews.tsx',import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const localRequire=name=>name==='react'?{...React,...hooks}:name==='./Provider'?{api}:name==='@/components/Link'?{__esModule:true,default:props=>React.createElement('a',props)}:name==='./Icons'?{ArrowRight:()=>null,RefreshCw:()=>null}:name==='@/lib/content'?{dateLabel:value=>value.slice(0,10).replaceAll('-','. ')}:require(name);
  vm.runInNewContext(code,{module:loaded,exports:loaded.exports,require:localRequire,Error,location:{reload(){assert.fail('Retry must not reload the page');}},console},{filename:'ToolReviews.tsx'});
  const Component=loaded.exports.default;
  function render(commit=true){cursor=0;dirty=false;tree=Component({tool});if(commit)flush();return tree;}
  function flush(){while(pending.size){const updates=[...pending];pending.clear();for(const [index,next] of updates){effects[index]?.cleanup?.();effects[index]={...next,cleanup:next.effect()};}if(dirty)render(false);}}
  function select(name){return nodes(tree).find(node=>node.type==='select'&&node.props['aria-label']===name);}
  return {
    requests,render,flush,get tree(){return tree;},markup:()=>renderToStaticMarkup(tree),text:()=>text(tree),select,
    change(name,value){assert.ok(select(name),`${name} filter must remain available`);select(name).props.onChange({target:{value}});render(false);},
    async settle(){await Promise.resolve();await Promise.resolve();await Promise.resolve();render();},
    retry(){const button=nodes(tree).find(node=>node.type==='button'&&text(node).includes('다시 불러오기'));assert.ok(button,'Score retry must be available');button.props.onClick();render(false);},
    dispose(){for(const effect of effects)effect?.cleanup?.();},
  };
}

test('named native filters and textual loading state are available on first render',()=>{
  const h=harness();h.render();
  assert.ok(h.select('평가 업무'));
  assert.ok(h.select('평가 요금제'));
  assert.match(h.text(),/모든 업무.*모든 요금제/);
  assert.match(h.text(),/불러오는 중입니다/);
  const status=nodes(h.tree).find(node=>node.props.role==='status');
  assert.equal(status.props['aria-live'],'polite');
  assert.equal(h.requests.length,1);
  h.dispose();
});

test('changing conditions hides old numbers and date before the new request effect commits',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample());await h.settle();
  assert.match(h.text(),/4\.2 \/ 5/);
  h.change('평가 업무','코딩');
  assert.doesNotMatch(h.text(),/4\.2 \/ 5|후기 6건|2026-10-02/);
  assert.match(h.text(),/코딩.*모든 요금제/);
  assert.match(h.text(),/불러오는 중입니다/);
  assert.equal(h.select('평가 업무').props.value,'코딩');
  assert.deepEqual(nodes(h.select('평가 업무')).filter(node=>node.type==='option').map(node=>text(node)),['모든 업무','문서 작성','코딩']);
  h.flush();assert.equal(h.requests.length,2);
  assert.equal(new URL(h.requests[1].path,'https://example.invalid').searchParams.get('task'),'코딩');
  h.dispose();
});

test('a delayed previous response cannot replace results or options for the current conditions',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample());await h.settle();
  h.change('평가 업무','문서 작성');h.flush();
  h.change('평가 요금제','Pro');h.flush();
  h.requests[2].resolve(sample({axes:{quality:{value:3.1,count:1}},sample:1}));await h.settle();
  h.requests[1].resolve(sample({axes:{quality:{value:4.9,count:4}},sample:4,tasks:['오래된 업무']}));await h.settle();
  assert.match(h.text(),/3\.1 \/ 5/);
  assert.doesNotMatch(h.text(),/4\.9 \/ 5|오래된 업무/);
  assert.equal(h.select('평가 업무').props.value,'문서 작성');
  assert.equal(h.select('평가 요금제').props.value,'Pro');
  h.dispose();
});

test('returning to earlier conditions still waits for a fresh response',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample());await h.settle();
  h.change('평가 업무','코딩');h.flush();
  h.change('평가 업무','');
  assert.doesNotMatch(h.text(),/4\.2 \/ 5|후기 6건|2026-10-02/);
  assert.match(h.text(),/모든 업무.*불러오는 중입니다/);
  h.flush();h.requests[2].resolve(sample({axes:{quality:{value:3.6,count:4}},sample:4}));await h.settle();
  h.requests[1].resolve(sample({axes:{quality:{value:4.9,count:5}},sample:5}));await h.settle();
  assert.match(h.text(),/3\.6 \/ 5/);
  assert.doesNotMatch(h.text(),/4\.9 \/ 5/);
  h.dispose();
});

test('an error retains options and selection; retry requests only scores for those conditions',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample());await h.settle();
  h.change('평가 업무','코딩');h.flush();h.change('평가 요금제','Pro');h.flush();
  h.requests[2].reject(new Error('평가 연결 실패'));await h.settle();
  assert.match(h.text(),/평가 연결 실패/);
  assert.equal(h.select('평가 업무').props.value,'코딩');
  assert.equal(h.select('평가 요금제').props.value,'Pro');
  assert.ok(nodes(h.select('평가 요금제')).some(node=>node.type==='option'&&text(node)==='Free'));
  h.retry();
  assert.doesNotMatch(h.text(),/평가 연결 실패|4\.2 \/ 5/);
  assert.match(h.text(),/불러오는 중입니다/);
  h.flush();assert.equal(h.requests.length,4);
  assert.equal(h.requests[3].path,h.requests[2].path);
  assert.ok(h.requests.every(request=>request.path.startsWith('/api/scores?')));
  h.requests[3].resolve(sample({axes:{value:{value:2.8,count:4}},sample:4}));await h.settle();
  assert.match(h.text(),/2\.8 \/ 5/);
  assert.match(h.text(),/후기 4건/);
  h.dispose();
});

test('review totals, axis responses and updated date retain their distinct meanings',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample({axes:{quality:{value:4.7,count:1}},sample:3}));await h.settle();
  assert.match(h.text(),/집계 대상 후기 3건/);
  assert.match(h.text(),/후기 갱신일.*2026-10-02/);
  const quality=nodes(h.tree).find(node=>node.props.className==='score-row'&&text(node).includes('결과 품질'));
  assert.match(text(quality),/응답 1건/);
  assert.match(text(quality),/소수 응답/);
  assert.doesNotMatch(text(quality),/3건/);
  assert.doesNotMatch(h.text(),/사용자 평가 \d+명|최근 사용일|테스트일|신뢰도|순위/);
  assert.match(h.text(),/직접 평가.*미평가/);
  assert.ok(nodes(h.tree).some(node=>node.props.href==='/community?tool=claude'&&text(node).includes('관련 후기')));
  h.dispose();
});

test('zero responses are unassessed and one to four responses are labeled with their real counts',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample({axes:{quality:{value:4,count:0},efficiency:{value:3,count:1},korean:{value:4,count:4},value:{value:4.2,count:5}},sample:5}));await h.settle();
  const rows=nodes(h.tree).filter(node=>node.props.className==='score-row');
  assert.match(text(rows[0]),/응답 0건.*미평가/);
  assert.doesNotMatch(text(rows[0]),/4\.0 \/ 5/);
  assert.match(text(rows[1]),/응답 1건.*소수 응답/);
  assert.match(text(rows[2]),/응답 4건.*소수 응답/);
  assert.match(text(rows[3]),/응답 5건.*4\.2 \/ 5/);
  assert.doesNotMatch(text(rows[3]),/소수 응답/);
  assert.match(text(rows[4]),/응답 0건.*미평가/);
  h.dispose();
});

test('an empty condition offers official features while keeping zero reviews and no updated date',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample({axes:{},sample:0,latest:null}));await h.settle();
  assert.match(h.text(),/집계 대상 후기 0건/);
  assert.match(h.text(),/집계할 후기가 없습니다/);
  assert.ok(nodes(h.tree).some(node=>node.props.href==='#features'));
  assert.doesNotMatch(h.text(),/게시일 미확인|사용자 평가 0명|0\.0 \/ 5/);
  h.dispose();
});

test('tool detail mounts one review region immediately after introduction and before official features',async()=>{
  const ToolReviews=()=>null,Link=props=>React.createElement('a',props),empty=()=>null;
  const fixture={id:'claude',name:'Claude',category:'chat',kind:'assistant',summary:'소개',description:'상세 소개',useCases:[],features:[],limitations:[],platforms:[],latestUpdate:{title:'소식',summary:'요약'}};
  const loaded={exports:{}};
  const source=fs.readFileSync(new URL('../app/tools/[id]/page.tsx',import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const fixtures={
    '@/components/Link':{__esModule:true,default:Link},
    'next/navigation':{notFound(){assert.fail('Known tool must render');}},
    '@/lib/catalog':{findTool:()=>fixture,similarTools:()=>[],catalog:[fixture],kindLabels:{assistant:'도우미'},categories:{chat:'대화'}},
    '@/lib/tool-genres':{toolGenres:()=>[],genreLabels:{}},
    '@/components/ToolFeatures':{__esModule:true,default:empty},
    '@/components/ToolEditorial':{__esModule:true,default:empty},
    '@/components/ToolPricing':{ToolPriceSummary:empty},
    '@/components/UpdateMeta':{__esModule:true,default:empty},
    '@/lib/content':{guides:[],dateLabel:()=>''},
    '@/components/ToolUI':{ToolLogo:empty,ToolCard:empty,SaveTool:empty,CompareButton:empty},
    '@/components/Icons':{ArrowRight:empty,ArrowUpRight:empty,Check:empty,Info:empty},
    '@/components/ToolReviews':{__esModule:true,default:ToolReviews},
  };
  vm.runInNewContext(code,{module:loaded,exports:loaded.exports,require:name=>fixtures[name]||require(name)});
  const tree=await loaded.exports.default({params:Promise.resolve({id:'claude'})});
  const sections=nodes(tree).filter(node=>node.type==='section'&&['overview','reviews','features'].includes(node.props.id));
  assert.deepEqual(sections.map(node=>node.props.id),['overview','reviews','features']);
  assert.equal(nodes(tree).filter(node=>node.type===ToolReviews).length,1);
  assert.equal(sections[1].props['aria-labelledby'],'reviews-title');
  assert.ok(nodes(tree).some(node=>node.type==='a'&&node.props.href==='#reviews'));
});

test('official metadata keeps source-specific verification dates and availability labels',()=>{
  const loaded={exports:{}};
  const source=fs.readFileSync(new URL('../components/UpdateMeta.tsx',import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInNewContext(code,{module:loaded,exports:loaded.exports,require:name=>name==='@/lib/content'?{dateLabel:value=>value||'게시일 미확인'}:require(name)});
  const Component=loaded.exports.default;
  const tree=Component({update:{publishedAt:'2026-10-20',checkedAt:'2026-10-22',statusLabel:'순차 제공',rollout:'계정별 제공'},checkedAt:'2026-09-12'});
  assert.match(text(tree),/게시 2026-10-20 · 확인 2026-10-22/);
  assert.doesNotMatch(text(tree),/2026-09-12/);
  assert.ok(nodes(tree).some(node=>node.props.title==='계정별 제공'&&text(node)==='순차 제공'));
  const fallback=Component({update:{publishedAt:null},checkedAt:'2026-09-12',compact:true});
  assert.match(text(fallback),/게시 게시일 미확인 · 확인 2026-09-12/);
});

test('selected filters remain available when the next response omits their options',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample());await h.settle();
  h.change('평가 업무','코딩');h.flush();h.change('평가 요금제','Pro');h.flush();
  h.requests[2].resolve(sample({tasks:[],plans:[]}));await h.settle();
  assert.ok(nodes(h.select('평가 업무')).some(node=>node.type==='option'&&text(node)==='코딩'));
  assert.ok(nodes(h.select('평가 요금제')).some(node=>node.type==='option'&&text(node)==='Pro'));
  assert.equal(h.select('평가 업무').props.value,'코딩');
  assert.equal(h.select('평가 요금제').props.value,'Pro');
  h.dispose();
});
