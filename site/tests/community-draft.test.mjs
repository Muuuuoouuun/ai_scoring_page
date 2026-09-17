import test from 'node:test';
import assert from 'node:assert/strict';
import {communityDraftKey,communityDraftReturn,readCommunityDraft,writeCommunityDraft} from '../lib/community-draft.ts';

test('a normal tool-filter compose returns to the same open draft after login',()=>{
  const context={toolId:'claude',kind:'question'};
  const url=new URL(communityDraftReturn(context),'https://example.test');
  assert.equal(url.pathname,'/community');
  assert.equal(url.searchParams.get('write'),'question');
  assert.equal(communityDraftKey({toolId:url.searchParams.get('tool')}),communityDraftKey(context));
  assert.equal(communityDraftKey(context),'ais-draft-claude');
});
test('reply login returns to the same thread and its parent-scoped draft',()=>{
  const url=new URL(communityDraftReturn({parentId:'parent-123',toolId:'claude',kind:'review'}),'https://example.test');
  assert.equal(url.pathname,'/community/parent-123');
  assert.equal(url.searchParams.get('write'),'reply');
  assert.equal(communityDraftKey({parentId:'parent-123',toolId:'claude'}),'ais-draft-parent-123');
});
test('restore keeps complete review values but never carries publication consent or unrelated keys',()=>{
  const draft={kind:'review',toolId:'claude',author:'검증',title:'보존 확인',body:'초안 본문',task:'문서 작성',plan:'Free',usedAt:'2026-09-12',affiliation:'none',ratings:{quality:4,korean:5}};
  const values=new Map();
  const storage=()=>({getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)});
  assert.equal(writeCommunityDraft(storage,'draft',draft),true);
  assert.deepEqual(readCommunityDraft(storage,'draft'),draft);
  values.set('draft',JSON.stringify({...draft,consent:true,publicConsent:true,unrelated:'ignored'}));
  assert.deepEqual(readCommunityDraft(storage,'draft'),draft);
});
test('blocked storage is a recoverable result so the form can stop a lossy login navigation',()=>{
  const unavailable=()=>{throw new Error('SecurityError');};
  assert.equal(readCommunityDraft(unavailable,'draft'),null);
  assert.equal(writeCommunityDraft(unavailable,'draft',{body:'unsent'}),false);
  assert.equal(writeCommunityDraft(()=>({setItem(){throw new Error('QuotaExceededError');}}),'draft',{body:'unsent'}),false);
});
test('malformed drafts cannot replace controlled string values with null or objects',()=>{
  for(const value of ['{','null','[]','3','"text"'])assert.equal(readCommunityDraft(()=>({getItem:()=>value}),'draft'),null);
  assert.deepEqual(readCommunityDraft(()=>({getItem:()=>JSON.stringify({body:null,title:{bad:true},author:'kept',ratings:{quality:0,korean:5,workflow:'4'}})}),'draft'),{author:'kept',ratings:{korean:5}});
});
