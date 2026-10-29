import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {harness} from './api-harness.mjs';
const read=()=>JSON.parse(fs.readFileSync(new URL('../data/tool-editorial.json',import.meta.url),'utf8'));
test('every catalog tool has a dated official digest with sourced feature and update summaries',()=>{
 const catalog=harness().load('lib/catalog.ts').catalog,notes=read();
 assert.equal(notes.length,catalog.length);
 assert.equal(new Set(notes.map(x=>x.toolId)).size,catalog.length);
 for(const tool of catalog){
  const entry=notes.find(x=>x.toolId===tool.id);assert.ok(entry,tool.id);
  assert.match(entry.checkedAt,/^\d{4}-\d{2}-\d{2}$/);assert.ok(entry.overview);
  assert.ok(entry.sources.length>0);assert.ok(entry.features.length>=2);assert.ok(entry.updates.length>0);
  for(const feature of entry.features){assert.ok(feature.sourceUrl.startsWith('https://'));assert.ok(tool.features.some(f=>f.name===feature.name&&f.sourceUrl===feature.sourceUrl),'catalog includes '+tool.id+' '+feature.name);}
  for(const update of entry.updates){assert.ok(update.sourceUrl.startsWith('https://'));assert.ok(update.summary);assert.ok(update.publishedAt===null||/^\d{4}-\d{2}-\d{2}$/.test(update.publishedAt));assert.ok(!update.publishedAt||update.publishedAt<=entry.checkedAt,'no future publication date');}
  assert.equal(tool.latestUpdate.checkedAt,entry.checkedAt);
 }
});
test('source-specific checks leave older general pricing verification intact',()=>{
 const catalog=harness().load('lib/catalog.ts').catalog;
 assert.ok(catalog.some(t=>t.checkedAt<t.latestUpdate.checkedAt));
 for(const t of catalog){assert.equal(new Set(t.features.map(f=>f.name)).size,t.features.length);assert.ok(t.latestUpdate.id);assert.ok(t.latestUpdate.revision>=1);}
});
