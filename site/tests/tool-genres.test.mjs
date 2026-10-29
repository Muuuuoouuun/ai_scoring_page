import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';
const h=harness();
const feature=(name,status='supported')=>({name,status,condition:'',description:'',sourceUrl:'https://example.invalid/official'});
const tool={id:'multi',name:'Multi',kind:'ai-app',category:'productivity',summary:'',description:'',aliases:[],useCases:[],pricing:'무료',korean:'지원',features:[feature('코드 작성'),feature('이미지 생성'),feature('음성 생성','unknown')]};
test('genres include multiple documented purposes and exclude unknown capabilities',()=>{
 const {toolGenres}=h.load('lib/tool-genres.ts');
 assert.deepEqual(Array.from(toolGenres(tool)),['productivity','development','image']);
});
test('genre filtering finds secondary purposes while legacy category links retain their meaning',()=>{
 const {rankCatalog}=h.load('lib/catalog-search.ts');
 assert.equal(rankCatalog([tool],'',{genre:'development'}).length,1);
 assert.equal(rankCatalog([tool],'',{genre:'audio'}).length,0);
 assert.equal(rankCatalog([tool],'',{category:'development'}).length,0);
});
