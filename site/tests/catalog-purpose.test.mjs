import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';
const {searchCatalog}=harness().load('lib/catalog.ts');
test('report drafting does not use project dashboards or report reading as writing evidence',()=>{
 for(const query of ['보고서 작성','보고서 초안을 만들고 문장을 다듬기']){
  const results=searchCatalog(query);assert.ok(results.some(t=>t.id==='claude'));
  assert.ok(!results.some(t=>t.id==='jira'),query+' must distinguish status-report viewing from authorship');
  const notebook=results.find(t=>t.id==='notebooklm');
  assert.ok(!notebook||!notebook.matchedUseCases.includes('논문·보고서 읽기'));
 }
});
test('project status reporting remains relevant when the requested purpose is dashboard reporting',()=>{
 const results=searchCatalog('프로젝트 진행 보고서와 대시보드');
 assert.ok(results.slice(0,3).some(t=>t.id==='jira'));
});

test('summarizing an existing report needs summary evidence, not dashboard viewing',()=>{
 const results=searchCatalog('기존 보고서를 읽고 핵심 내용을 요약하고 싶어요');
 assert.ok(!results.some(t=>t.id==='jira'));
 assert.ok(results.some(t=>t.id==='notebooklm'));
});
