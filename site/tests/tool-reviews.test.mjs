import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const tool={id:'claude'};
const sample=(overrides={})=>({axes:{quality:{value:4.2,count:5,distribution:[0,0,1,2,2]}},sample:6,ratedSample:5,tasks:['문서 작성','코딩'],plans:['Free','Pro'],latest:'2026-10-02T11:20:00.000Z',usedAtRange:{earliest:'2026-09-10',latest:'2026-09-29'},recentReviews:[],...overrides});
const nodes=tree=>Array.isArray(tree)?tree.flatMap(nodes):tree&&typeof tree==='object'&&tree.props?[tree,...nodes(tree.props.children)]:[];
const text=tree=>Array.isArray(tree)?tree.map(text).join(''):tree&&typeof tree==='object'&&tree.props?text(tree.props.children):typeof tree==='string'||typeof tree==='number'?String(tree):'';
function loadLibrary(file){
  const loaded={exports:{}};
  const output=ts.transpileModule(fs.readFileSync(new URL('../lib/'+file+'.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(output,{module:loaded,exports:loaded.exports,require:name=>name.startsWith('./')?loadLibrary(name.slice(2)):require(name),Date,JSON,console});
  return loaded.exports;
}

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
  const localRequire=name=>{
    if(name.endsWith('.css'))return {};
    if(name==='@/lib/scoring'){
      return loadLibrary('scoring');
    }
    return name==='react'?{...React,...hooks}:name==='./Provider'?{api}:name==='@/components/Link'?{__esModule:true,default:props=>React.createElement('a',props)}:name==='./Icons'?{ArrowRight:()=>null}:name==='@/lib/content'?{dateLabel:value=>value.slice(0,10).replaceAll('-','. ')}:require(name);
  };
  vm.runInNewContext(code,{module:loaded,exports:loaded.exports,require:localRequire,Error,location:{reload(){assert.fail('Retry must not reload the page');}},console},{filename:'ToolReviews.tsx'});
  const Component=loaded.exports.default;
  function render(commit=true){cursor=0;dirty=false;tree=Component({tool,children:React.createElement('section',{id:'overview'},'공식 기능 개괄')});if(commit)flush();return tree;}
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
  assert.ok(h.select('평가 플랜'));
  assert.match(h.text(),/모든 업무.*모든 플랜/);
  assert.match(h.text(),/불러오고 있습니다/);
  const status=nodes(h.tree).find(node=>node.props.role==='status');
  assert.equal(status.props['aria-live'],'polite');
  assert.equal(h.requests.length,1);
  h.dispose();
});

test('changing conditions hides old numbers and date before the new request effect commits',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample());await h.settle();
  assert.match(h.text(),/4\.2 \/ 5/);
  h.change('평가 업무','코딩');
  assert.doesNotMatch(h.text(),/4\.2 \/ 5|후기 6건|2026\. 10\. 02/);
  assert.match(h.text(),/코딩.*모든 플랜/);
  assert.match(h.text(),/불러오고 있습니다/);
  assert.equal(h.select('평가 업무').props.value,'코딩');
  assert.deepEqual(nodes(h.select('평가 업무')).filter(node=>node.type==='option').map(node=>text(node)),['모든 업무','문서 작성','코딩']);
  h.flush();assert.equal(h.requests.length,2);
  assert.equal(new URL(h.requests[1].path,'https://example.invalid').searchParams.get('task'),'코딩');
  h.dispose();
});

test('a delayed previous response cannot replace results or options for the current conditions',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample());await h.settle();
  h.change('평가 업무','문서 작성');h.flush();
  h.change('평가 플랜','Pro');h.flush();
  h.requests[2].resolve(sample({axes:{quality:{value:3.1,count:1}},sample:1}));await h.settle();
  h.requests[1].resolve(sample({axes:{quality:{value:4.9,count:4}},sample:4,tasks:['오래된 업무']}));await h.settle();
  assert.match(h.text(),/3\.1 \/ 5/);
  assert.doesNotMatch(h.text(),/4\.9 \/ 5|오래된 업무/);
  assert.equal(h.select('평가 업무').props.value,'문서 작성');
  assert.equal(h.select('평가 플랜').props.value,'Pro');
  h.dispose();
});

test('returning to earlier conditions still waits for a fresh response',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample());await h.settle();
  h.change('평가 업무','코딩');h.flush();
  h.change('평가 업무','');
  assert.doesNotMatch(h.text(),/4\.2 \/ 5|후기 6건|2026\. 10\. 02/);
  assert.match(h.text(),/모든 업무.*불러오고 있습니다/);
  h.flush();h.requests[2].resolve(sample({axes:{quality:{value:3.6,count:4}},sample:4}));await h.settle();
  h.requests[1].resolve(sample({axes:{quality:{value:4.9,count:5}},sample:5}));await h.settle();
  assert.match(h.text(),/3\.6 \/ 5/);
  assert.doesNotMatch(h.text(),/4\.9 \/ 5/);
  h.dispose();
});

test('an error retains options and selection; retry requests only scores for those conditions',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample());await h.settle();
  h.change('평가 업무','코딩');h.flush();h.change('평가 플랜','Pro');h.flush();
  h.requests[2].reject(new Error('평가 연결 실패'));await h.settle();
  assert.match(h.text(),/평가 연결 실패/);
  assert.equal(h.select('평가 업무').props.value,'코딩');
  assert.equal(h.select('평가 플랜').props.value,'Pro');
  assert.ok(nodes(h.select('평가 플랜')).some(node=>node.type==='option'&&text(node)==='Free'));
  h.retry();
  assert.doesNotMatch(h.text(),/평가 연결 실패|4\.2 \/ 5/);
  assert.match(h.text(),/불러오고 있습니다/);
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
  assert.match(h.text(),/후기 갱신일.*2026\. 10\. 02/);
  const quality=nodes(h.tree).find(node=>node.props.className==='score-row'&&text(node).includes('결과 품질'));
  assert.match(text(quality),/응답 1건/);
  assert.match(text(quality),/소수 응답 평균/);
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
  assert.match(text(rows[1]),/응답 1건.*소수 응답 평균/);
  assert.match(text(rows[2]),/응답 4건.*소수 응답 평균/);
  assert.match(text(rows[3]),/응답 5건.*4\.2 \/ 5/);
  assert.doesNotMatch(text(rows[3]),/소수 응답 평균/);
  assert.match(text(rows[4]),/응답 0건.*미평가/);
  h.dispose();
});

test('an empty condition offers official features while keeping zero reviews and no updated date',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample({axes:{},sample:0,latest:null}));await h.settle();
  assert.match(h.text(),/집계 대상 후기 0건/);
  assert.match(h.text(),/집계할 후기가 없습니다/);
  assert.ok(nodes(h.tree).some(node=>node.props.href==='#features'));
  assert.equal(nodes(h.tree).filter(node=>node.props.className==='score-track').length,0,'No numerical tracks for a wholly unscored condition');
  assert.doesNotMatch(h.text(),/게시일 미확인|사용자 평가 0명|0\.0 \/ 5/);
  h.dispose();
});

test('all five sub scores are visible immediately below the direct-assessment tier',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample({axes:{quality:{value:2,count:1,distribution:[0,1,0,0,0]},workflow:{value:5,count:1,distribution:[0,0,0,0,1]}}}));await h.settle();
  const summary=nodes(h.tree).find(node=>node.props.className==='review-summary-axes');
  assert.ok(summary,'Five sub scores must be distinct from distribution detail');
  assert.match(text(summary),/結果品質|결과 품질/);
  assert.match(text(summary),/작업 효율/);
  assert.match(text(summary),/한국어.*비용 대비.*작업 연결.*5\.0 \/ 5/);
  const tier=nodes(h.tree).find(node=>node.props.className==='service-tier');
  assert.match(text(tier),/직접 평가 티어.*미평가/);
  assert.doesNotMatch(text(tier),/5\.0|추천|S티어|A티어/,'A user mean cannot turn into a vetted editorial tier');
  assert.ok(h.text().indexOf(text(tier))<h.text().indexOf(text(summary)));
  assert.equal(nodes(h.tree).filter(node=>node.type==='details').some(node=>nodes(node).includes(summary)),false,'Sub scores must not require disclosure');
  assert.ok(nodes(h.tree).some(node=>node.type==='details'&&text(node).includes('전체 항목')));
  h.dispose();
});

test('official overview stays between score summary and visible original-review cards',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample({recentReviews:[{id:'review-rich',title:'보고서 초안에 활용',author:'문서 사용자',excerpt:'근거를 확인하며 초안을 다듬었습니다.',affiliation:'sponsored',task:'보고서 작성',plan:'Pro',usedAt:'2026-09-29',updatedAt:'2026-10-02T11:20:00.000Z',ratings:{quality:4}}]}));await h.settle();
  const all=nodes(h.tree),summary=all.find(node=>node.props.className==='review-summary-axes'),overview=all.find(node=>node.props.id==='overview'),review=all.find(node=>node.type==='article'&&node.props.className==='user-review-card');
  assert.ok(review,'Original-review cards must be visible without opening the methodology disclosure');
  assert.ok(all.indexOf(summary)<all.indexOf(overview)&&all.indexOf(overview)<all.indexOf(review));
  assert.match(text(review),/문서 사용자.*제품·비용 지원받음.*보고서 초안에 활용.*근거를 확인하며 초안을 다듬었습니다/);
  assert.match(text(review),/보고서 작성.*Pro.*사용일.*2026\. 09\. 29/);
  assert.ok(nodes(review).some(node=>node.props.href==='/community/review-rich'));
  assert.ok(!all.some(node=>node.type==='details'&&nodes(node).includes(review)));
  h.change('평가 업무','코딩');
  assert.doesNotMatch(h.text(),/보고서 초안에 활용|문서 사용자|근거를 확인하며/,'Old review evidence must disappear with old scores before the next effect commits');
  h.dispose();
});

test('distribution and included review links explain the source without mixing update and use dates',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample({recentReviews:[{id:'review-1',title:'문서 작성 경험',task:'문서 작성',plan:'Pro',usedAt:'2026-09-29',updatedAt:'2026-10-02T11:20:00.000Z',ratings:{quality:4}}]}));await h.settle();
  assert.match(h.text(),/점수 입력 후기 5건/);
  assert.match(h.text(),/사용일 범위.*2026\. 09\. 10.*2026\. 09\. 29/);
  const distribution=nodes(h.tree).find(node=>node.props.className==='review-distribution');
  assert.ok(distribution);
  assert.match(text(distribution),/1점.*0건.*2점.*0건.*3점.*1건.*4점.*2건.*5점.*2건/);
  assert.ok(nodes(h.tree).some(node=>node.props.href==='/community/review-1'&&text(node).includes('문서 작성 경험')));
  assert.match(h.text(),/후기 갱신일.*2026\. 10\. 02/);
  h.dispose();
});

test('fractional responses remain visible outside exact integer distribution bins',async()=>{
  const h=harness();h.render();h.requests[0].resolve(sample({axes:{quality:{value:3.8,count:2,distribution:[0,0,0,0,1],fractionalCount:1}}}));await h.settle();
  assert.match(h.text(),/소수점 응답 1건/);
  assert.match(h.text(),/정수 점수 분포와 별도로/);
  h.dispose();
});

test('tool detail shares one review instance with official introduction and features as its children',async()=>{
  const ToolReviews=()=>null,Link=props=>React.createElement('a',props),empty=()=>null;
  const fixture={id:'claude',name:'Claude',category:'chat',kind:'assistant',summary:'소개',description:'상세 소개',useCases:[],features:[],limitations:[],platforms:[],latestUpdate:{title:'소식',summary:'요약'}};
  const loaded={exports:{}};
  const source=fs.readFileSync(new URL('../app/tools/[id]/page.tsx',import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const fixtures={
    '@/components/Link':{__esModule:true,default:Link},
    'next/navigation':{notFound(){assert.fail('Known tool must render');}},
    '@/lib/catalog':{findTool:()=>fixture,relatedTools:()=>[],kindLabels:{assistant:'도우미'},categories:{chat:'대화'}},
    '@/lib/content':{guides:[],dateLabel:()=>''},
    '@/components/ToolUI':{ToolLogo:empty,ToolCard:empty,SaveTool:empty,CompareButton:empty},
    '@/components/Icons':{ArrowRight:empty,ArrowUpRight:empty,Check:empty,Info:empty},
    '@/components/ToolReviews':{__esModule:true,default:ToolReviews},
    '@/components/ServiceBrief':{__esModule:true,default:empty},
    '@/app/service-brief.css':{},
  };
  vm.runInNewContext(code,{module:loaded,exports:loaded.exports,require:name=>fixtures[name]||require(name)});
  const tree=await loaded.exports.default({params:Promise.resolve({id:'claude'})});
  const sections=nodes(tree).filter(node=>node.type==='section'&&['overview','reviews','feature-details'].includes(node.props.id));
  assert.deepEqual(sections.map(node=>node.props.id),['overview','feature-details']);
  assert.equal(nodes(tree).filter(node=>node.type===ToolReviews).length,1);
  const reviews=nodes(tree).find(node=>node.type===ToolReviews);
  assert.ok(nodes(reviews.props.children).some(node=>node.props.id==='overview'));
  assert.ok(nodes(reviews.props.children).some(node=>node.props.id==='features'));
  assert.ok(nodes(tree).some(node=>node.type==='details'&&nodes(node).some(child=>child.props.id==='features')),'Feature links target evidence inside the native disclosure');
  assert.ok(nodes(tree).some(node=>node.type==='a'&&node.props.href==='#ratings'));
  assert.ok(nodes(tree).some(node=>node.type==='a'&&node.props.href==='#reviews'));
});
