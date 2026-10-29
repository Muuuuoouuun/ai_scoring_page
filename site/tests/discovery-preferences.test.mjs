import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';
const h=harness();
const {normalizeTopics,defaultTopics,toolsForTopic,topicHref}=h.load('lib/discovery-preferences.ts');
const {catalog}=h.load('lib/catalog.ts');
test('untrusted stored preferences retain valid unique topics and recover from empty or malformed data',()=>{
  assert.equal(JSON.stringify(normalizeTopics(['image','image','unknown',null,'ai'])),JSON.stringify(['image','ai']));
  for(const value of [null,{},'ai',[],['unknown']])assert.equal(JSON.stringify(normalizeTopics(value)),JSON.stringify(defaultTopics));
  assert.equal(normalizeTopics(['ai','image','collaboration','development','productivity','research','writing']).length,6);
});
test('preferred topic links and home candidates use the same documented filters',()=>{
  assert.equal(topicHref('ai'),'/explore?kind=ai-app');
  assert.equal(topicHref('image'),'/explore?genre=image');
  assert.ok(toolsForTopic(catalog,'ai').length>0);
  assert.ok(toolsForTopic(catalog,'ai').every(t=>t.kind==='ai-app'));
  assert.ok(toolsForTopic(catalog,'image').some(t=>t.id==='figma'));
  assert.ok(toolsForTopic(catalog,'collaboration').some(t=>t.id==='slack'));
});
