import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

// Root-confirmed contract, 2026-09-13. Only this /private/tmp file is written.
// Actual helper is imported unchanged. Storage is an in-memory browser-boundary fixture.
// No fetch, browser, login, Site mutation, or real community POST is used.
const modulePath='/Users/bigmac_moon/dev/ai_score/site/lib/community-draft.ts';
const exists=fs.existsSync(modulePath);
const draft=exists?await import(pathToFileURL(modulePath).href):null;
const behavior=(name,fn)=>test(name,{skip:!exists},fn);
test('planned community draft module contract is present',()=>{
 assert.ok(exists,'lib/community-draft.ts has not been implemented; behavior cases are prepared, not executed');
 for(const name of ['communityDraftKey','communityDraftReturn','readCommunityDraft','writeCommunityDraft'])assert.equal(typeof draft[name],'function',name);
});
function memory(initial={}){
 const values=new Map(Object.entries(initial));
 return {values,getItem(key){return values.get(key)??null;},setItem(key,value){values.set(key,String(value));}};
}
const sample={kind:'review',toolId:'claude',author:'V16 local author',title:'V16 review draft',body:'첫째 줄\n둘째 줄 — synthetic draft',task:'문서 검토',plan:'Free',usedAt:'2026-09-12',affiliation:'none',ratings:{quality:4,korean:3}};
const key='ais-draft-claude';
const round=x=>JSON.parse(JSON.stringify(x));
const parseRoute=route=>{assert.equal(typeof route,'string');assert.ok(route.startsWith('/')&&!route.startsWith('//'),'return route must stay origin-relative');const url=new URL(route,'https://qa.example.invalid');assert.equal(url.origin,'https://qa.example.invalid');assert.ok(url.pathname==='/community'||url.pathname.startsWith('/community/'),'must remain a community route');assert.equal(url.hash,'');return url;};

behavior('legacy draft key remains compatible and post/reply/tool precedence stays explicit',()=>{
 assert.equal(draft.communityDraftKey({}),'ais-draft-new');
 assert.equal(draft.communityDraftKey({toolId:'claude'}),'ais-draft-claude');
 assert.equal(draft.communityDraftKey({parentId:'parent-1',toolId:'claude'}),'ais-draft-parent-1');
 assert.equal(draft.communityDraftKey({postId:'post-1',parentId:'parent-1',toolId:'claude'}),'ais-draft-post-1');
 assert.equal(draft.communityDraftKey({postId:'',parentId:'',toolId:''}),'ais-draft-new');
 // Legacy storage key namespace is intentionally not redesigned by this test.
});

behavior('normal return route carries chosen kind and tool, without publishing intent',()=>{
 const url=parseRoute(draft.communityDraftReturn({kind:'question',toolId:'claude'}));
 assert.equal(url.pathname,'/community');assert.equal(url.searchParams.get('write'),'question');assert.equal(url.searchParams.get('tool'),'claude');
 assert.equal(url.searchParams.has('submit'),false);assert.equal(url.searchParams.has('publish'),false);
});

behavior('all supported top-level kinds survive authentication return',()=>{
 for(const kind of ['review','question','discussion','feature'])assert.equal(parseRoute(draft.communityDraftReturn({kind})).searchParams.get('write'),kind);
});

behavior('invalid or orphan reply kind returns a normal discussion form',()=>{
 for(const kind of [undefined,'','reply','admin','javascript:alert(1)','question&tool=wrong']){
  const url=parseRoute(draft.communityDraftReturn({kind}));assert.equal(url.pathname,'/community');assert.equal(url.searchParams.get('write'),'discussion');
 }
});

behavior('reply return preserves exact parent and cannot become a top-level review',()=>{
 const parentId='d60e9418-6d55-4e17-8719-ae3455a861bf';
 const url=parseRoute(draft.communityDraftReturn({parentId,toolId:'claude',kind:'review'}));
 assert.equal(url.pathname,'/community/'+parentId);assert.equal(url.searchParams.get('write'),'reply');
});

behavior('parent and tool strings cannot inject another origin, query action, or fragment',()=>{
 for(const parentId of ['//evil.invalid/x','../signin-with-chatgpt','x?write=feature&submit=1','x#publish','한글 / 답글']){
  const url=parseRoute(draft.communityDraftReturn({parentId,kind:'question'}));
  assert.equal(url.pathname,'/community/'+encodeURIComponent(parentId));assert.equal(url.searchParams.get('write'),'reply');assert.equal([...url.searchParams.keys()].filter(k=>k==='write').length,1);
  assert.equal(url.searchParams.has('submit'),false);
 }
 const toolId='claude&write=feature#injected';const url=parseRoute(draft.communityDraftReturn({toolId,kind:'question'}));
 assert.equal(url.searchParams.get('tool'),toolId);assert.equal(url.searchParams.get('write'),'question');assert.equal([...url.searchParams.keys()].filter(k=>k==='write').length,1);
});

behavior('successful storage round trip preserves user text, review context and chosen ratings',()=>{
 const storage=memory(),input=structuredClone(sample);assert.equal(draft.writeCommunityDraft(()=>storage,key,input),true);
 assert.deepEqual(round(draft.readCommunityDraft(()=>storage,key)),sample);assert.deepEqual(input,sample,'saving cannot rewrite the React input object');
});

behavior('reading an absent draft is null and never writes another context',()=>{
 const storage=memory({'ais-draft-chatgpt':JSON.stringify(sample)});const before=Object.fromEntries(storage.values);
 assert.equal(draft.readCommunityDraft(()=>storage,key),null);assert.deepEqual(Object.fromEntries(storage.values),before);
});

behavior('malformed JSON and non-object payloads cannot enter form state',()=>{
 for(const raw of ['{broken','null','[]','[{}]','"text"','42','true']){
  const storage=memory({[key]:raw});assert.equal(draft.readCommunityDraft(()=>storage,key),null,raw);assert.equal(storage.getItem(key),raw,'read must not erase raw data as a side effect');
 }
});

behavior('read keeps known partial fields but drops identity, publication consent, and unknown controls',()=>{
 const storage=memory({[key]:JSON.stringify({title:'A partial title',body:'keep this body',toolId:'claude',id:'other-post',parentId:'other-parent',userId:'other-user',publicConsent:true,consent:true,submit:true,unknown:'ignore'})});
 const result=draft.readCommunityDraft(()=>storage,key);assert.ok(result);
 assert.equal(result.title,'A partial title');assert.equal(result.body,'keep this body');assert.equal(result.toolId,'claude');
 for(const field of ['id','parentId','userId','publicConsent','consent','submit','unknown'])assert.equal(Object.hasOwn(result,field),false,field);
});

behavior('invalid known values do not replace form defaults with objects or unsupported enums',()=>{
 const storage=memory({[key]:JSON.stringify({title:{html:'not a string'},body:['array'],author:7,usedAt:null,toolId:false,kind:'admin',affiliation:'trusted-admin',task:'a valid task'})});
 const result=draft.readCommunityDraft(()=>storage,key);assert.ok(result);assert.equal(result.task,'a valid task');
 for(const field of ['title','body','author','usedAt','toolId'])assert.equal(Object.hasOwn(result,field),false,field);
 assert.ok(result.kind===undefined||['review','question','discussion','feature','reply'].includes(result.kind));
 assert.ok(result.affiliation===undefined||['none','maker','sponsored'].includes(result.affiliation));
});

behavior('only known integral ratings from one through five restore',()=>{
 const storage=memory({[key]:JSON.stringify({ratings:{quality:5,efficiency:2.5,korean:'4',value:0,workflow:6,unknown:4}})});
 const result=draft.readCommunityDraft(()=>storage,key);assert.ok(result);assert.deepEqual(round(result.ratings),{quality:5});
});

behavior('array or scalar ratings are never spread into valid score axes',()=>{
 for(const ratings of [[1,2,3],null,'5',true]){
  const result=draft.readCommunityDraft(()=>memory({[key]:JSON.stringify({body:'safe body',ratings})}),key);assert.ok(result);assert.equal(result.body,'safe body');
  assert.ok(result.ratings===undefined||Object.keys(result.ratings).length===0);
 }
});

behavior('prototype and constructor payloads do not survive sanitization at root or ratings',()=>{
 const raw='{"title":"safe title","__proto__":{"v16Polluted":true},"constructor":{"prototype":{"v16Polluted":true}},"prototype":{"v16Polluted":true},"ratings":{"quality":4,"__proto__":{"v16Polluted":true},"constructor":5,"prototype":5}}';
 const result=draft.readCommunityDraft(()=>memory({[key]:raw}),key);assert.ok(result);assert.equal(result.title,'safe title');assert.deepEqual(round(result.ratings),{quality:4});
 for(const object of [result,result.ratings])for(const field of ['__proto__','constructor','prototype'])assert.equal(Object.hasOwn(object,field),false,field);
 assert.equal({}.v16Polluted,undefined);
});

behavior('blocked window.sessionStorage getter yields null read and false save without throwing',()=>{
 const unavailable=()=>{throw Object.assign(new Error('storage unavailable'),{name:'SecurityError'});};
 assert.equal(draft.readCommunityDraft(unavailable,key),null);assert.equal(draft.writeCommunityDraft(unavailable,key,sample),false);
});

behavior('storage getItem exceptions do not crash draft recovery',()=>{
 const storage={getItem(){throw new Error('read blocked');},setItem(){throw new Error('unexpected write');}};
 assert.equal(draft.readCommunityDraft(()=>storage,key),null);
});

behavior('quota failure returns false without deleting the previous draft',()=>{
 const storage=memory({[key]:'previous raw draft'});storage.setItem=()=>{throw Object.assign(new Error('quota exceeded'),{name:'QuotaExceededError'});};
 assert.equal(draft.writeCommunityDraft(()=>storage,key,sample),false);assert.equal(storage.getItem(key),'previous raw draft');
});

behavior('serialization failure returns false and leaves the previous draft intact',()=>{
 const storage=memory({[key]:'previous raw draft'}),circular={body:'new'};circular.self=circular;
 assert.equal(draft.writeCommunityDraft(()=>storage,key,circular),false);assert.equal(storage.getItem(key),'previous raw draft');
});
