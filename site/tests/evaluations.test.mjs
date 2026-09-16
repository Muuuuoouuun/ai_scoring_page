import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';
const api=harness().load('lib/evaluations.ts');
const catalog=harness().load('lib/catalog.ts');

test('ratings are normalized only when they read as a score',()=>{
 assert.equal(api.parseRating('4.7/5'),94);
 assert.equal(api.parseRating('9.1 / 10'),91);
 assert.equal(api.parseRating('82.3%'),82.3);
 assert.equal(api.parseRating('4.5'),90);
 assert.equal(api.parseRating('리뷰 91건'),null);
 assert.equal(api.parseRating('확인 필요'),null);
 assert.equal(api.parseRating('6/5'),null);
});

test('editorial score weights reliability and functionality most',()=>{
 const flat={functionality:80,uiux:80,reliability:80,comfort:80,pricing:80};
 assert.equal(api.editorialScore(flat),80);
 assert.equal(api.editorialScore({...flat,reliability:0}),60);
 assert.equal(api.editorialScore({...flat,uiux:0}),68);
});

test('external score weights review sites and ignores unreadable entries',()=>{
 const scored=api.externalScore([{source:'G2',score:'4.5/5'},{source:'Trustpilot',score:'1.5/5'},{source:'설문 재인용',score:'확인 필요'}]);
 assert.equal(scored.count,2);
 assert.equal(scored.score,70);
 assert.equal(api.externalScore([{source:'G2',score:'리뷰 12건'}]),null);
});

test('composite falls back to the editorial score when no site rating parses',()=>{
 const base={scores:{functionality:80,uiux:80,reliability:80,comfort:80,pricing:80},externalRatings:[]};
 assert.equal(api.verdictOf(base).composite,80);
 assert.equal(api.verdictOf({...base,externalRatings:[{source:'G2',score:'4.5/5'}]}).composite,83);
});

test('tiers move with the composite score',()=>{
 assert.equal(api.tierOf(85),'strong');
 assert.equal(api.tierOf(75),'recommended');
 assert.equal(api.tierOf(65),'conditional');
 assert.equal(api.tierOf(64),'caution');
});

test('every evaluation points at a tool in the catalog',()=>{
 for(const id of Object.keys(api.evaluations))assert.ok(catalog.findTool(id),id+' has no catalog entry');
});

test('evaluations carry sources, dated history and distinct comparisons',()=>{
 for(const [id,evaluation] of Object.entries(api.evaluations)){
  assert.ok(evaluation.verdict.length>10,id+' needs a verdict');
  assert.ok(evaluation.sources.length>=4,id+' needs sources');
  for(const source of evaluation.sources)assert.match(source.url,/^https?:\/\//,id+' source must be a link');
  assert.ok(evaluation.history.length>=3,id+' needs change history');
  for(const entry of evaluation.history){
   assert.match(entry.date,/^\d{4}-\d{2}(-\d{2})?$/,id+' history needs a date');
   assert.ok(entry.date>='2025-01',id+' history should stay recent');
   assert.ok(['high','medium','low'].includes(entry.level),id+' history needs an impact level');
  }
  const rivals=evaluation.comparisons.map(c=>c.competitor);
  assert.equal(new Set(rivals).size,rivals.length,id+' repeats a comparison target');
  assert.match(evaluation.checkedAt,/^\d{4}-\d{2}$/,id+' needs a checked month');
  for(const axis of ['functionality','uiux','reliability','comfort','pricing']){
   const value=evaluation.scores[axis];
   assert.ok(Number.isInteger(value)&&value>=0&&value<=100,id+' has an out-of-range '+axis);
  }
 }
});

test('ranking is dense so tied tools share a position',()=>{
 const ids=Object.keys(api.evaluations);
 const ranked=ids.map(id=>api.evaluationRank(id));
 for(const entry of ranked){assert.ok(entry.rank>=1);assert.equal(entry.total,ids.length);}
 assert.equal(Math.min(...ranked.map(r=>r.rank)),1);
});
