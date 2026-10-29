import test from 'node:test';
import assert from 'node:assert/strict';
import {communityLinks} from '../lib/community-links.ts';
test('shared sources deduplicate and trim common sentence punctuation',()=>{
  assert.deepEqual(communityLinks('공식: https://github.com/org/repo. 다시 https://github.com/org/repo\n(https://docs.example.com/start?q=hello#next)'),[{url:'https://github.com/org/repo',host:'github.com'},{url:'https://docs.example.com/start?q=hello#next',host:'docs.example.com'}]);
});
test('source cards never accept script, data, credentials, invalid URLs, or unlimited links',()=>{
  assert.deepEqual(communityLinks('javascript:alert(1) data:text/html,hello http://example.com https://me:secret@example.com https://localhost https://%'),[]);
  assert.equal(communityLinks(Array.from({length:12},(_,i)=>'https://example.com/'+i).join(' ')).length,5);
});
test('balanced URL parentheses survive while surrounding prose parentheses are removed',()=>{
  const url='https://en.wikipedia.org/wiki/Claude_(language_model)';
  assert.equal(communityLinks('문서 ('+url+').')[0].url,url);
  assert.equal(communityLinks(url)[0].url,url);
});
