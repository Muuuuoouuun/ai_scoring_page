import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';

function seed(h,{id,ratings=null,status='published',userId=id,title='공개 사용 경험',body='원문에서 확인할 사용 경험'}){
 h.sql.prepare('INSERT INTO posts(id,user_id,author,kind,tool_id,title,body,task,plan,used_at,affiliation,ratings,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
  .run(id,userId,'공개 작성자','review','chatgpt',title,body,'보고서 작성','Free','2026-09-10','none',ratings,status,'2026-10-03T00:00:00Z','2026-10-03T00:00:00Z');
}

async function read(h,query){
 const response=await h.community.GET(new Request('https://example.invalid/api/community?'+query));
 return {status:response.status,data:await response.json()};
}

test('malformed rating evidence still opens its public source without fabricated scores',async()=>{
 const h=harness();
 seed(h,{id:'broken-review',ratings:'{broken'});
 const scores=await h.scores.GET(new Request('https://example.invalid/api/scores?tool=chatgpt'));
 assert.equal(scores.status,200);
 const aggregate=await scores.json();
 assert.equal(aggregate.sample,1);
 assert.equal(aggregate.ratedSample,0);
 assert.deepEqual(aggregate.axes,{});
 const sourceId=aggregate.recentReviews[0].id;
 const original=await read(h,'id='+encodeURIComponent(sourceId));
 assert.equal(original.status,200,'an included public source must remain readable even when its ratings are malformed');
 assert.equal(original.data.posts.length,1);
 assert.equal(original.data.posts[0].title,'공개 사용 경험');
 assert.equal(original.data.posts[0].body,'원문에서 확인할 사용 경험');
 assert.deepEqual(original.data.posts[0].ratings,{});
 assert.equal(original.data.posts[0].user_id,undefined);
});

test('list and source reads keep valid fractional ratings and exclude invalid or unknown axes',async()=>{
 const h=harness();
 seed(h,{id:'mixed-review',ratings:JSON.stringify({quality:2.5,efficiency:1.25,korean:0,value:6,workflow:'4',unknown:5})});
 seed(h,{id:'array-review',ratings:'[1,2,3]'});
 seed(h,{id:'scalar-review',ratings:'4'});
 seed(h,{id:'unrated-review'});
 const list=await read(h,'tool=chatgpt&kind=review');
 assert.equal(list.status,200);
 assert.deepEqual(list.data.posts.find(post=>post.id==='mixed-review').ratings,{quality:2.5,efficiency:1.25});
 assert.deepEqual(list.data.posts.find(post=>post.id==='array-review').ratings,{});
 assert.deepEqual(list.data.posts.find(post=>post.id==='scalar-review').ratings,{});
 assert.equal(list.data.posts.find(post=>post.id==='unrated-review').ratings,null);
 const original=await read(h,'id=mixed-review');
 assert.equal(original.status,200);
 assert.deepEqual(original.data.posts[0].ratings,{quality:2.5,efficiency:1.25});
 const scores=await h.scores.GET(new Request('https://example.invalid/api/scores?tool=chatgpt'));
 const aggregate=await scores.json();
 assert.equal(aggregate.axes.quality.value,2.5);
 assert.equal(aggregate.axes.quality.count,1);
 assert.equal(aggregate.axes.quality.fractionalCount,1);
 assert.deepEqual(aggregate.recentReviews.find(review=>review.id==='mixed-review').ratings,original.data.posts[0].ratings);
});

test('tolerant rating reads retain published-only visibility and omit private account identity',async()=>{
 const h=harness();
 seed(h,{id:'public-review',ratings:'{broken',userId:'alpha'});
 seed(h,{id:'hidden-review',ratings:'{broken',status:'hidden',userId:'hidden-owner',body:'비공개 숨긴 원문'});
 seed(h,{id:'deleted-review',ratings:'{broken',status:'deleted',userId:'deleted-owner',body:'삭제된 원문'});
 const privateRecord=await h.save('library',{name:'개인 도구 기록',status:'interested',note:'개인 메모'});
 assert.equal(privateRecord.status,200);
 h.user(null);
 const list=await read(h,'tool=chatgpt&kind=review');
 assert.equal(list.status,200);
 assert.deepEqual(list.data.posts.map(post=>post.id),['public-review']);
 assert.equal(list.data.posts[0].mine,false);
 assert.equal(list.data.posts[0].user_id,undefined);
 assert.ok(!JSON.stringify(list.data).includes('개인 메모'));
 for(const id of ['hidden-review','deleted-review',privateRecord.data.record.id]){
  const original=await read(h,'id='+encodeURIComponent(id));
  assert.equal(original.status,200);
  assert.deepEqual(original.data.posts,[]);
 }
 h.user({userId:'alpha'});
 const owned=await read(h,'id=public-review');
 assert.equal(owned.status,200);
 assert.equal(owned.data.posts[0].mine,true);
 assert.equal(owned.data.posts[0].user_id,undefined);
});
