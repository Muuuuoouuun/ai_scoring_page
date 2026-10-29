import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const catalog=JSON.parse(readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8'));

test('logo synchronization sources are HTTPS assets rather than downloadable archives',()=>{
  for(const tool of catalog){
    const source=new URL(tool.logoSource);
    assert.equal(source.protocol,'https:',tool.id+' logo source must use HTTPS');
    assert.doesNotMatch(source.pathname,/\.(?:zip|tar|gz|rar|7z)$/i,tool.id+' logo source must be an image, not a brand asset archive');
  }
});
