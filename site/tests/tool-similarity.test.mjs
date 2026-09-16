import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';
const api=harness().load('lib/catalog.ts');
const feature=(name,status='supported',condition='')=>({name,status,condition,description:'',sourceUrl:'https://example.invalid/official'});
const tool=(id,features,extra={})=>({id,name:id,kind:'saas',category:'productivity',features,useCases:[],...extra});

test('same category alone never supplies a supposedly similar tool',()=>{
 const source=tool('source',[feature('채널 메시지')]);
 assert.deepEqual(api.relatedTools(source,[source,tool('unrelated',[feature('웹 호스팅')])]),[]);
});
test('common supported functionality drives alternatives across categories',()=>{
 const source=tool('source',[feature('프로젝트 보드')]);
 const match=tool('match',[feature('칸반 보드')],{category:'project-management'});
 assert.deepEqual(api.relatedTools(source,[source,tool('unrelated',[feature('이미지 생성')]),match]).map(t=>t.id),['match']);
});
test('conditional evidence keeps its source and plan condition without certifying equivalence',()=>{
 assert.equal(typeof api.similarTools,'function');
 const source=tool('source',[feature('화상 회의')]);
 const f=feature('음성·영상 회의','conditional','그룹 회의는 유료 플랜');
 const result=api.similarTools(source,[source,tool('match',[f])]);
 assert.equal(result.length,1);assert.equal(result[0].tool.id,'match');
 assert.equal(result[0].matches[0].candidateFeatures[0].condition,f.condition);
 assert.equal(result[0].matches[0].candidateFeatures[0].sourceUrl,f.sourceUrl);
});
test('unknown functions and model-only services are not app substitutes',()=>{
 const source=tool('source',[feature('문서 초안')],{kind:'ai-app'});
 assert.deepEqual(api.relatedTools(source,[source,tool('unknown',[feature('문서 초안','unknown')]),tool('model',[feature('문서 초안')],{kind:'model'})]),[]);
});
test('image input or meeting transcription alone is not image generation or live meeting hosting',()=>{
 assert.deepEqual(api.relatedTools(tool('source',[feature('이미지 생성')]),[tool('input',[feature('이미지 입력')])]),[]);
 assert.deepEqual(api.relatedTools(tool('source',[feature('화상 회의')]),[tool('transcription',[feature('회의 음성 전사')])]),[]);
});

test('image editing documented under a broader feature label keeps its evidence and plan limits',()=>{
 const canva=api.findTool('canva');
 const result=api.similarTools(canva,api.catalog).find(x=>x.tool.id==='adobe-firefly');
 assert.ok(result);
 const match=result.matches.find(m=>m.id==='image-editing');
 assert.ok(match);
 assert.ok(match.sourceFeatures.some(f=>f.description.includes('배경 제거')&&f.condition&&f.sourceUrl));
 assert.ok(!result.matches.some(m=>m.id==='image-generation'));
});

test('server infrastructure project resources do not mean workflow project management',()=>{
 const api=harness().load('lib/catalog.ts');
 const results=api.similarTools(api.findTool('supabase'),api.catalog);
 const falseMatch=results.filter(x=>['linear','notion'].includes(x.tool.id)).flatMap(x=>x.matches.filter(m=>m.id==='projects'&&m.sourceFeatures.some(f=>f.name==='프로젝트 자원 확장')).map(m=>({candidate:x.tool.id,source:m.sourceFeatures.map(f=>f.name),candidateFeatures:m.candidateFeatures.map(f=>f.name)})));
 assert.deepEqual(falseMatch,[],'Infrastructure capacity does not establish work planning functionality');
});

test('current development-agent feature evidence links Cursor and GitHub Copilot',()=>{
 const api=harness().load('lib/catalog.ts');
 const results=api.similarTools(api.findTool('cursor'),api.catalog);
 assert.ok(results.some(x=>x.tool.id==='github-copilot'),'Both current feature sets document delegated development work');
});


test('compound feature labels distinguish generation, input, collaboration and model capabilities',()=>{
 const get=id=>api.findTool(id);
 const pair=(a,b)=>api.similarTools(get(a),[get(b)])[0]?.matches.map(m=>m.id)||[];
 assert.ok(pair('adobe-firefly','runway').includes('image-generation'));
 assert.ok(pair('adobe-firefly','runway').includes('video-generation'));
 assert.ok(pair('microsoft-teams','slack').includes('team-messaging'));
 assert.ok(pair('mistral-vibe','github-copilot').includes('coding'));
 assert.ok(pair('deepseek-v4-1-flash','gemini-3-8-flash').includes('structured-output'));
 assert.ok(!pair('monday','slack').includes('team-messaging'));
 const input=tool('input',[feature('텍스트·이미지 입력')],{kind:'model'});
 assert.equal(api.similarTools(input,[tool('generate',[feature('이미지 생성')],{kind:'model'})]).length,0);
 const moodboard=tool('moodboard',[feature('창작 보드'),feature('영상 편집 타임라인')]);
 assert.equal(api.similarTools(moodboard,[tool('pm',[feature('프로젝트 관리')])]).length,0);
});
