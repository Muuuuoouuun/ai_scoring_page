import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';
const h=harness(),{searchCatalog,catalog}=h.load('lib/catalog.ts');
const ids=(q,o)=>searchCatalog(q,o).map(t=>t.id);

test('long task descriptions find directly evidenced writing, design, planning and automation tools',()=>{
 for(const [q,wanted] of [
  ['고객에게 보낼 제안서 초안을 작성하고 문장을 다듬고 싶어요',['claude','chatgpt']],
  ['앱 화면 프로토타입을 만들고 팀과 디자인 검토',['figma']],
  ['할 일의 상태와 마감일을 관리하고 캘린더로 보고 싶어요',['notion','asana','trello','monday']],
  ['폼에 새 문의가 들어오면 다른 앱으로 데이터를 옮기고 알림을 보내기',['zapier','make']]
 ])assert.ok(ids(q).slice(0,3).some(id=>wanted.includes(id)),q);
});
test('negative category clauses do not boost their excluded categories',()=>{
 for(const [q,category,wanted] of [
  ['이미지 생성 말고 보고서 작성','image',['claude','chatgpt']],
  ['코딩 도구는 제외하고 개인 업무 정리','development',['notion']]
 ]){const result=searchCatalog(q);assert.ok(result.slice(0,3).some(t=>wanted.includes(t.id)),q);assert.ok(result.every(t=>t.category!==category),q);}
});
test('type exclusions and product exclusions preserve the remaining positive task',()=>{
 const models=searchCatalog('API 모델 말고 논문 자료를 읽는 앱');
 assert.ok(models.length);assert.ok(models.every(t=>t.kind!=='model'));
 assert.ok(ids('보고서 작성 도구 중 ChatGPT 제외').includes('claude'));
 assert.ok(!ids('보고서 작성 도구 중 ChatGPT 제외').includes('chatgpt'));
});
test('positive clauses, punctuation and unknown tasks are not mistaken for exclusions or empty browsing',()=>{
 assert.ok(ids('이미지 생성이 필요해요').includes('midjourney'));
 assert.equal(ids('%').length,0);assert.equal(ids('양자중력 실험장비 원격 교정').length,0);
 assert.equal(ids('').length,catalog.length);assert.equal(ids('  ').length,catalog.length);
});
test('hard filters never relax for an empty intersection',()=>{
 assert.equal(ids('Midjourney',{free:true}).length,0);
 assert.equal(ids('자동화',{category:'automation',free:true,korean:true}).length,0);
 assert.equal(ids('코딩',{owned:[]}).length,0);
 assert.ok(ids('코딩',{owned:['cursor','github-copilot'],free:true}).every(id=>['cursor','github-copilot'].includes(id)));
 assert.equal(ids('개인 업무 정리',{category:'image',kind:'model'}).length,0);
});
test('matched features retain the actual condition and official source instead of a generic free assertion',()=>{
 const slack=searchCatalog('무료로 그룹 허들 회의를 하고 싶어요',{free:true,korean:true}).find(t=>t.id==='slack');
 assert.ok(slack);const feature=slack.matchedFeatures?.find(f=>f.name==='허들');
 assert.ok(feature,'The requested huddle feature must be exposed to the recommendation renderer');
 assert.match(feature.condition,/그룹 허들.*유료/);
 const original=catalog.find(t=>t.id==='slack').features.find(f=>f.name==='허들');
 assert.equal(feature.sourceUrl,original.sourceUrl);assert.equal(feature.condition,original.condition);
});
test('direct image generation evidence outranks category-only design matches',()=>{
 const result=searchCatalog('이미지 생성',{free:true,korean:true});
 assert.ok(result.slice(0,2).some(t=>['chatgpt','gemini'].includes(t.id)));
 assert.ok(result.every(t=>t.id!=='midjourney'));
});
test('names and aliases remain searchable without mutating catalog facts',()=>{
 const before=JSON.stringify(catalog);assert.equal(ids('Notion')[0],'notion');assert.equal(ids('GitHub Copilot')[0],'github-copilot');
 searchCatalog('코딩 도구는 제외하고 개인 업무 정리');assert.equal(JSON.stringify(catalog),before);
});
test('unknown exclusion subjects cannot capture an earlier unrelated task',()=>{
 const {interpretCatalogQuery}=h.load('lib/catalog.ts');const meaning=interpretCatalogQuery('보고서 작성, 광고는 제외하고');
 assert.equal(meaning.exclusions.length,0);assert.ok(meaning.unresolvedExclusions.some(s=>s.includes('광고')));
 assert.ok(meaning.positive.includes('보고서'));assert.ok(ids('보고서 작성, 광고는 제외하고').includes('claude'));
});
test('double negation and optional free pricing do not impose opposite restrictions',()=>{
 assert.ok(ids('Notion은 제외하지 말고 문서 작성').includes('notion'));
 assert.ok(ids('무료가 아닌 이미지 생성').includes('midjourney'));
 assert.ok(ids('무료가 아니어도 이미지 생성').includes('midjourney'));
});
test('exclusion matching respects whole Korean subjects and common negative forms',()=>{
 const {interpretCatalogQuery}=h.load('lib/catalog.ts');
 const unknown=interpretCatalogQuery('바코드 도구는 제외하고 문서 작성');
 assert.equal(unknown.exclusions.length,0);assert.ok(unknown.unresolvedExclusions.some(s=>s.includes('바코드')));
 assert.ok(searchCatalog('이미지 생성이 아닌 보고서 작성').every(t=>t.category!=='image'));
 assert.ok(!ids('Notion 없이 보고서 작성').includes('notion'));
 assert.ok(ids('Notion 없이 보고서 작성').includes('claude'));
});
test('requirements with no catalog confirmation are exposed alongside relevant candidates',()=>{
 const offline=searchCatalog('인터넷 연결 없이 기기 안에서만 문서를 요약');
 assert.ok(offline.length);assert.ok(offline.every(t=>t.unverifiedRequirements?.some(s=>/오프라인/.test(s))&&t.unverifiedRequirements.some(s=>/기기/.test(s))));
 const steps=searchCatalog('무료 플랜에서 한 번의 입력으로 네 단계 자동화',{free:true});
 assert.ok(steps.length);assert.ok(steps.every(t=>t.unverifiedRequirements?.some(s=>/네 단계.*무료|무료.*네 단계/.test(s))));
});
test('task objects take precedence over generic creation and conversation wording',()=>{
 assert.equal(ids('Notion 제외하고 팀 대화를 채널별로 모으고 싶어요')[0],'slack');
 assert.ok(!ids('보고서 작성').includes('midjourney'));
 assert.ok(!ids('이미지 생성').includes('gpt-6-astra'));
 assert.ok(!ids('논문 여러 편을 비교하고 출처를 확인하면서 요약').includes('slack'));
 assert.equal(ids('집 근처 자전거 수리점의 방문 예약을 대신 확정해 주는 서비스').length,0);
});
test('coding exclusions use primary purpose without excluding development planning',()=>{
 const result=searchCatalog('코딩 도구는 원하지 않아요. 팀 프로젝트의 이슈와 개발 주기를 관리');
 assert.equal(result[0]?.id,'linear');
 assert.ok(result.every(t=>!/(?:코딩|코드)/u.test(t.summary)));
});
test('requirements preserve negative and optional scope',()=>{
 const {interpretCatalogQuery}=h.load('lib/catalog.ts');
 assert.ok(!interpretCatalogQuery('비상업용 웹 배포').requirements.includes('상업용 사용'));
 assert.ok(!interpretCatalogQuery('오프라인은 필요 없고 문서 요약').requirements.includes('오프라인 사용'));
 assert.ok(!interpretCatalogQuery('무제한이 아닌 문서 요약').requirements.includes('사용량 무제한'));
});
test('a requested meeting is not satisfied by unrelated audio input',()=>{
 const result=searchCatalog('무료로 그룹 허들 회의를 하고 싶어요');
 assert.ok(result.some(t=>t.id==='slack'));
 assert.ok(result.every(t=>!['gemini','gemini-3-8-flash'].includes(t.id)));
});

test('expanded categories and aliases find the new services while exclusions stay strict',()=>{
 assert.ok(ids('pms').some(id=>['asana','jira','trello'].includes(id)));
 assert.ok(ids('음성 더빙').includes('elevenlabs'));
 assert.ok(ids('영상 생성').includes('runway'));
 assert.ok(searchCatalog('영상 말고 이미지 생성').every(t=>t.category!=='video'));
 for(const [category,wanted]of [['project-management','asana'],['collaboration','microsoft-teams'],['audio','elevenlabs'],['video','runway']]){
  const result=searchCatalog('',{category});assert.ok(result.some(t=>t.id===wanted));assert.ok(result.every(t=>t.category===category));
 }
});
