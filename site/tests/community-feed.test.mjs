import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';

function seed(h,{id,created='2026-10-01T00:00:00.000Z',parent=null,status='published',kind='discussion',tool='chatgpt',owner='alpha'}){
  h.sql.prepare('INSERT INTO posts(id,user_id,author,kind,tool_id,parent_id,title,body,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id,owner,'Test author',kind,tool,parent,'Test title','Test body',status,created,created);
}
async function feed(h,query=''){
  const response=await h.community.GET(new Request('https://example.invalid/api/community?'+query));
  assert.equal(response.status,200);
  return (await response.json()).posts;
}
function helpful(h,post,count){for(let n=0;n<count;n++)h.sql.prepare('INSERT INTO reactions(id,user_id,post_id,created_at) VALUES(?,?,?,?)').run(post+'-r'+n,'reactor'+n,post,'2026-10-03T00:00:00.000Z');}

test('latest and popular feeds use real reactions with deterministic date and ID tie breakers',async()=>{
  const h=harness();seed(h,{id:'old'});seed(h,{id:'new-a',created:'2026-10-02T00:00:00.000Z'});seed(h,{id:'new-b',created:'2026-10-02T00:00:00.000Z'});
  helpful(h,'old',2);helpful(h,'new-a',1);helpful(h,'new-b',1);
  assert.deepEqual((await feed(h)).map(p=>p.id),['new-b','new-a','old']);
  const popular=await feed(h,'sort=popular');assert.deepEqual(popular.map(p=>p.id),['old','new-b','new-a']);assert.deepEqual(popular.map(p=>p.helpful),[2,1,1]);
  assert.deepEqual((await feed(h,'sort=arbitrary')).map(p=>p.id),['new-b','new-a','old']);
});

test('feed filters and published reply counts remain correct under popular ordering',async()=>{
  const h=harness();seed(h,{id:'question',kind:'question'});seed(h,{id:'other-tool',tool:'claude',kind:'question'});seed(h,{id:'other-kind'});seed(h,{id:'hidden',status:'hidden',kind:'question'});
  seed(h,{id:'reply',parent:'question',kind:'reply'});seed(h,{id:'removed-reply',parent:'question',kind:'reply',status:'deleted'});seed(h,{id:'hidden-reply',parent:'question',kind:'reply',status:'hidden'});helpful(h,'hidden',5);
  const posts=await feed(h,'sort=popular&kind=question&tool=chatgpt');assert.deepEqual(posts.map(p=>p.id),['question']);assert.equal(posts[0].replies,1);assert.equal(posts[0].helpful,0);assert.equal(posts[0].mine,true);assert.equal(Object.hasOwn(posts[0],'user_id'),false);
});

test('thread replies are oldest first, stay scoped to one parent, and survive original deletion',async()=>{
  const h=harness();seed(h,{id:'root'});seed(h,{id:'other-root'});seed(h,{id:'reply-1',parent:'root',kind:'reply'});seed(h,{id:'reply-2',parent:'root',kind:'reply',created:'2026-10-02T00:00:00.000Z'});seed(h,{id:'other-reply',parent:'other-root',kind:'reply'});seed(h,{id:'hidden',parent:'root',kind:'reply',status:'hidden'});
  assert.deepEqual((await feed(h,'parent=root&sort=popular')).map(p=>p.id),['reply-1','reply-2']);
  h.sql.prepare("UPDATE posts SET status='deleted',body='' WHERE id='root'").run();
  assert.equal((await feed(h,'id=root')).length,0);assert.deepEqual((await feed(h,'parent=root')).map(p=>p.id),['reply-1','reply-2']);
});


test('long threads retain the newest replies inside the bounded chronological window',async()=>{
  const h=harness();seed(h,{id:'root'});
  for(let n=0;n<101;n++)seed(h,{id:'reply-'+String(n).padStart(3,'0'),parent:'root',kind:'reply'});
  const replies=await feed(h,'parent=root');assert.equal(replies.length,100);assert.equal(replies[0].id,'reply-001');assert.equal(replies.at(-1).id,'reply-100');
  assert.equal((await feed(h,'id=root'))[0].replies,101);
});
