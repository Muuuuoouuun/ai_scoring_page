import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';

const discussion={kind:'discussion',author:'Test author',title:'Discussion for moderation',body:'Test discussion body',publicConsent:true};
const review={kind:'review',toolId:'chatgpt',author:'Test author',title:'Rated review',body:'Test review body',task:'Document writing',plan:'Free',usedAt:'2026-09-10',publicConsent:true};
const alpha={userId:'alpha',email:'alpha@example.invalid'};
const beta={userId:'beta',email:'beta@example.invalid'};

test('reporting a resolved post again reopens the report with its new reason and receipt time',async()=>{
  let clock='2026-10-23T00:00:00.000Z';
  const h=harness(undefined,{now:()=>clock}),actions=h.load('app/api/community/actions/route.ts'),admin=h.load('app/api/admin/route.ts');
  const post=await h.call(h.community.POST,discussion);assert.equal(post.status,201);
  h.user(beta);
  assert.equal((await h.call(actions.POST,{action:'report',postId:post.data.id,reason:'Original reason'})).status,200);
  const original=h.sql.prepare('SELECT * FROM reports WHERE user_id=?').get('beta');
  h.env.ADMIN_USER_IDS='alpha';h.user(alpha);
  assert.equal((await h.call(admin.POST,{action:'resolve',id:original.id})).status,200);
  assert.equal(h.sql.prepare('SELECT status FROM reports WHERE id=?').get(original.id).status,'resolved');
  clock='2026-10-24T00:00:00.000Z';h.user(beta);
  const repeated=await h.call(actions.POST,{action:'report',postId:post.data.id,reason:'A newly observed issue'});
  assert.equal(repeated.status,200);assert.equal(repeated.data.received,true);
  h.user(alpha);
  const reports=(await h.call(admin.GET,null,'GET')).data.reports;
  assert.equal(reports.length,1);assert.equal(reports[0].id,original.id);
  assert.equal(reports[0].status,'received');assert.equal(reports[0].reason,'A newly observed issue');
  assert.equal(reports[0].created_at,clock);
});

test('review submission rejects fractional ratings instead of silently dropping them from scores',async()=>{
  const h=harness();
  const rejected=await h.call(h.community.POST,{...review,ratings:{quality:2.5}});
  assert.equal(rejected.status,400);
  assert.equal(h.sql.prepare('SELECT COUNT(*) count FROM posts').get().count,0);
  const accepted=await h.call(h.community.POST,{...review,ratings:{quality:3,workflow:5}});
  assert.equal(accepted.status,201);
  const scores=await (await h.scores.GET(new Request('https://example.invalid/api/scores?tool=chatgpt'))).json();
  assert.equal(scores.sample,1);assert.equal(scores.ratedReviewCount,1);
  assert.equal(scores.axes.quality.value,3);assert.equal(scores.axes.workflow.value,5);
});

test('authenticated reactions toggle per account and reject hidden targets or missing identities',async()=>{
  const h=harness(),actions=h.load('app/api/community/actions/route.ts'),admin=h.load('app/api/admin/route.ts');
  const post=await h.call(h.community.POST,discussion);assert.equal(post.status,201);
  const helpful=()=>h.call(actions.POST,{action:'helpful',postId:post.data.id});
  h.user(null);assert.equal((await helpful()).status,401);
  h.user(alpha);assert.equal((await helpful()).data.helpful,true);
  h.user(beta);assert.equal((await helpful()).data.helpful,true);
  h.user(alpha);assert.equal((await helpful()).data.helpful,false);
  const result=await (await h.community.GET(new Request('https://example.invalid/api/community?id='+post.data.id))).json();
  assert.equal(result.posts[0].helpful,1);
  assert.equal(h.sql.prepare('SELECT user_id FROM reactions').get().user_id,'beta');
  h.env.ADMIN_USER_IDS='alpha';assert.equal((await h.call(admin.POST,{action:'hide',id:post.data.id})).status,200);
  assert.equal((await helpful()).status,404);
  assert.equal((await h.call(actions.POST,{action:'report',postId:post.data.id,reason:'Hidden target'})).status,404);
});
