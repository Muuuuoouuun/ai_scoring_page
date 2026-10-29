import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';
const h=harness();
const {readExploreFilters,exploreQuery}=h.load('lib/explore-filters.ts');

test('all search conditions survive a URL round trip including Korean text',()=>{
 const filters={q:'문서 & 요약',category:'writing',genre:'audio',kind:'ai-app',free:true,korean:true};
 const actual=readExploreFilters(new URLSearchParams(exploreQuery(filters)));
 assert.equal(JSON.stringify(actual),JSON.stringify(filters));
});
test('invalid categories and types recover to all while false flags stay false',()=>{
 const actual=readExploreFilters(new URLSearchParams('category=unknown&kind=unknown&free=false&korean=0'));
 assert.equal(actual.category,'all');assert.equal(actual.kind,'all');
 assert.equal(actual.free,false);assert.equal(actual.korean,false);
});
test('reset produces a clean URL and empty input does not fabricate conditions',()=>{
 const filters=readExploreFilters(new URLSearchParams());
 assert.equal(exploreQuery(filters),'');assert.equal(filters.q,'');
});
