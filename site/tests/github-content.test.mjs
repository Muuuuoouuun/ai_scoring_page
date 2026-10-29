import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {harness} from './api-harness.mjs';

const dataPath=new URL('../data/github-content.json',import.meta.url);
const modulePath=new URL('../lib/github-content.ts',import.meta.url);
function content(){
  assert.ok(fs.existsSync(dataPath),'The GitHub hub must ship a dated, source-backed snapshot');
  return JSON.parse(fs.readFileSync(dataPath,'utf8'));
}
function helpers(){
  assert.ok(fs.existsSync(modulePath),'The GitHub hub must expose tested URL and filtering behavior');
  return harness().load('lib/github-content.ts');
}

test('every section has useful, dated entries with primary GitHub sources',()=>{
  const data=content();
  assert.equal(data.mode,'curated-snapshot');
  assert.match(data.checkedAt,/^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Set(data.entries.map(item=>item.id)).size,data.entries.length);
  for(const section of ['trends','steady','issues']){
    assert.ok(data.entries.filter(item=>item.section===section).length>=3,section+' needs more than a placeholder');
  }
  for(const item of data.entries){
    assert.match(item.id,/^[a-z0-9-]+$/);
    assert.ok(item.summary.length>30,item.id+' needs an explanatory summary');
    assert.ok(item.reason.length>15,item.id+' needs an editorial selection reason');
    assert.ok(item.nextStep.length>15,item.id+' needs an actionable next step');
    assert.ok(item.tags.length>=2,item.id+' needs searchable topic tags');
    assert.equal(item.checkedAt,data.checkedAt);
    assert.ok(item.sources.length>=1,item.id+' must cite its evidence');
    for(const source of item.sources){
      const url=new URL(source.url);
      assert.equal(url.protocol,'https:');
      assert.equal(url.hostname,'github.com');
      assert.ok(!url.username&&!url.password);
      assert.ok(source.label.length>2);
    }
    if(item.publishedAt){
      assert.match(item.publishedAt,/^\d{4}-\d{2}-\d{2}$/);
      assert.ok(item.publishedAt<=item.checkedAt,item.id+' cannot claim a future announcement');
    }
    if(item.release){
      assert.ok(item.sources.some(source=>source.url===item.release.url));
      assert.ok(item.release.url.includes('/releases/tag/'));
      assert.equal(item.release.publishedAt,item.publishedAt);
    }
    for(const misleading of ['stars','starGrowth','trendingRank','liveRank'])assert.equal(item[misleading],undefined);
  }
});

test('security and migration issues distinguish the affected scope from the next action',()=>{
  const data=content();
  for(const item of data.entries.filter(entry=>entry.section==='issues')){
    assert.ok(item.scope.length>15,item.id+' needs an affected scope');
    assert.ok(['security','migration','maintenance'].includes(item.issueType));
  }
  const dify=data.entries.find(item=>item.id==='dify-weaviate-upgrade');
  assert.match(dify.scope,/Weaviate/);
  assert.match(dify.nextStep,/단계/);
  const n8n=data.entries.find(item=>item.id==='n8n-webhook-advisory');
  assert.match(n8n.scope,/1\.65\.0/);
  assert.match(n8n.scope,/1\.121\.0/);
});

test('tab, topic, sort, and Korean search survive a shareable URL round trip',()=>{
  const {readGitHubFilters,githubQuery}=helpers();
  const filters={tab:'issues',category:'automation',sort:'curated',q:'문서 & 지식'};
  const roundTrip=readGitHubFilters(new URLSearchParams(githubQuery(filters)));
  assert.equal(JSON.stringify(roundTrip),JSON.stringify(filters));
});

test('unrecognized URL conditions recover and empty filters produce a clean route',()=>{
  const {readGitHubFilters,githubQuery,emptyGitHubFilters}=helpers();
  const filters=readGitHubFilters(new URLSearchParams('tab=oops&category=__proto__&sort=stars'));
  assert.equal(JSON.stringify(filters),JSON.stringify(emptyGitHubFilters));
  assert.equal(githubQuery(emptyGitHubFilters),'');
  assert.equal(readGitHubFilters(new URLSearchParams('q='+'a'.repeat(300))).q.length,160);
});

test('search combines tab, category, and all query words without case sensitivity',()=>{
  const {filterGitHubEntries,emptyGitHubFilters}=helpers();
  const entries=content().entries;
  const result=filterGitHubEntries(entries,{...emptyGitHubFilters,category:'coding',q:'  GEMINI   mcp '});
  assert.deepEqual(result.map(item=>item.id),['gemini-cli']);
  assert.equal(filterGitHubEntries(entries,{...emptyGitHubFilters,tab:'issues',q:'gemini'}).length,0);
  assert.equal(filterGitHubEntries(entries,{...emptyGitHubFilters,category:'models',q:'gemini'}).length,0);
});

test('recent sort uses publication dates, leaves undated guidance last, and never mutates source data',()=>{
  const {filterGitHubEntries,emptyGitHubFilters}=helpers();
  const entries=content().entries,before=JSON.stringify(entries);
  const result=filterGitHubEntries(entries,{...emptyGitHubFilters,tab:'issues'});
  const dates=result.map(item=>item.publishedAt||'');
  assert.deepEqual(dates,[...dates].sort().reverse());
  assert.equal(JSON.stringify(entries),before);
  assert.deepEqual(filterGitHubEntries(entries,{...emptyGitHubFilters,tab:'issues',sort:'curated'}).map(item=>item.id),entries.filter(item=>item.section==='issues').map(item=>item.id));
});
