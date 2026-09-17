import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {harness} from './api-harness.mjs';
function setup(){
 assert.ok(existsSync(new URL('../app/api/feedback/route.ts',import.meta.url)), 'Feedback API must exist');
 const h=harness(), handler=h.load('app/api/feedback/route.ts').POST;
 return {...h, feedback:(body,headers)=>h.call(handler,body,'POST',headers), summary:()=>h.load('lib/feedback.ts').feedbackSummary()};
}
const request=(session,action='start',scope='information',extra={})=>({session,action,scope,...(action==='start'?{context:'home'}:{}),...extra});
const alpha={userId:'alpha',email:'alpha@example.invalid',fullName:'Alpha'};
const beta={userId:'beta',email:'beta@example.invalid',fullName:'Beta'};
test('guest can start information feedback; raw capability and user identity are not returned or stored',async()=>{
 const h=setup();h.user(null);const token=randomUUID(),r=await h.feedback(request(token));assert.equal(r.status,200);assert.equal(r.data.record.answer,null);
 const row=h.sql.prepare('SELECT * FROM feedback_sessions').get();assert.equal(row.user_id,null);assert.equal(row.session_hash.length,64);assert.ok(!JSON.stringify(row).includes(token));assert.ok(!JSON.stringify(r.data).includes(row.session_hash));assert.equal(r.data.record.question_version,'2026-09-12-v1');
});
test('personal feedback requires authenticated identity',async()=>{
 const h=setup();h.user(null);assert.equal((await h.feedback(request(randomUUID(),'start','personal'))).status,401);assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM feedback_sessions').get().n,0);
});
test('reopening and parallel duplicate starts preserve one start, original context and answer',async()=>{
 const h=setup(),s=randomUUID();await Promise.all([h.feedback(request(s)),h.feedback(request(s))]);await h.feedback(request(s,'answer','information',{answer:'partly',comment:'조건 설명이 더 필요합니다.'}));
 const r=await h.feedback(request(s,'start','information',{context:'tools'}));assert.equal(r.data.record.answer,'partly');assert.equal(r.data.record.context,'home');assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM feedback_sessions').get().n,1);
});
test('answer editing replaces current response instead of adding another respondent',async()=>{
 const h=setup(),s=randomUUID();await h.feedback(request(s));assert.equal((await h.feedback(request(s,'answer','information',{answer:'helped',comment:' 처음 의견 '}))).status,200);
 const r=await h.feedback(request(s,'answer','information',{answer:'not_helped',comment:'수정한 의견'}));assert.equal(r.status,200);assert.equal(r.data.record.comment,'수정한 의견');assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM feedback_sessions').get().n,1);assert.equal(r.data.record.answer,'not_helped');
});
test('guest, two member accounts and two scopes cannot read or edit each other using the same tab token',async()=>{
 const h=setup(),s=randomUUID();h.user(null);await h.feedback(request(s));await h.feedback(request(s,'answer','information',{answer:'helped',comment:'guest'}));
 h.user(alpha);assert.equal((await h.feedback(request(s,'answer','information',{answer:'partly'}))).status,404);await h.feedback(request(s));await h.feedback(request(s,'answer','information',{answer:'partly',comment:'alpha'}));
 h.user(beta);const b=await h.feedback(request(s));assert.equal(b.data.record.answer,null);await h.feedback(request(s,'start','personal'));assert.equal((await h.feedback(request(s,'answer','personal',{answer:'not_tried'}))).status,200);
 h.user(null);assert.equal((await h.feedback(request(s))).data.record.comment,'guest');h.user(alpha);assert.equal((await h.feedback(request(s))).data.record.comment,'alpha');assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM feedback_sessions').get().n,4);
});
test('another token cannot answer or delete an existing response',async()=>{
 const h=setup(),s=randomUUID();await h.feedback(request(s));await h.feedback(request(s,'answer','information',{answer:'helped'}));
 assert.equal((await h.feedback(request(randomUUID(),'answer','information',{answer:'not_helped'}))).status,404);assert.equal((await h.feedback(request(randomUUID(),'delete'))).status,200);assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM feedback_sessions').get().n,1);
});
test('guest can delete their current tab response, leaving other sessions intact',async()=>{
 const h=setup(),s=randomUUID();h.user(null);await h.feedback(request(s));await h.feedback(request(randomUUID()));assert.equal((await h.feedback(request(s,'delete'))).status,200);assert.equal((await h.feedback(request(s,'delete'))).status,200);assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM feedback_sessions').get().n,1);
});
test('strict input rejects forged identity, versions, page queries, invalid choices and oversized comments',async()=>{
 const h=setup(),s=randomUUID();for(const body of [request(s,'start','information',{userId:'beta'}),request(s,'start','information',{question_version:'forged'}),request(s,'start','information',{context:'/search?q=private'}),request('invalid'),request(s,'answer','information',{answer:'yes'}),request(s,'answer','information',{answer:'helped',comment:'x'.repeat(1001)})])assert.equal((await h.feedback(body)).status,400);
 assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM feedback_sessions').get().n,0);
});
test('cross-origin and cross-site mutations are rejected before saving',async()=>{
 const h=setup();assert.equal((await h.feedback(request(randomUUID()),{Origin:'https://attacker.invalid'})).status,403);assert.equal((await h.feedback(request(randomUUID()),{'Sec-Fetch-Site':'cross-site'})).status,403);assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM feedback_sessions').get().n,0);
});
test('admin summary uses separate 30-day start cohorts and excludes undecided/not-tried from evaluable denominator',async()=>{
 const h=setup();h.user(null);
 for(const answer of ['helped','partly','not_helped','not_tried','undecided',null]){const s=randomUUID();await h.feedback(request(s));if(answer)await h.feedback(request(s,'answer','information',{answer}));}
 h.user(alpha);let s=randomUUID();await h.feedback(request(s,'start','personal'));await h.feedback(request(s,'answer','personal',{answer:'helped'}));
 s=randomUUID();await h.feedback(request(s));await h.feedback(request(s,'answer','information',{answer:'helped',comment:'outside cohort'}));h.sql.prepare("UPDATE feedback_sessions SET started_at='2020-01-01T00:00:00.000Z' WHERE comment='outside cohort'").run();
 const r=await h.summary(),info=r.scopes.find(x=>x.scope==='information'),personal=r.scopes.find(x=>x.scope==='personal');assert.equal(info.starts,6);assert.equal(info.answers,5);assert.equal(info.unanswered,1);assert.equal(info.evaluable,3);assert.equal(info.helped,1);assert.equal(info.helpedShare,1/3);assert.equal(info.notTried,1);assert.equal(info.undecided,1);assert.equal(info.guests.answers,5);assert.equal(info.members.starts,0);assert.equal(personal.starts,1);assert.equal(personal.helpedShare,1);assert.equal(r.recent.some(x=>x.comment==='outside cohort'),false);assert.equal(r.questionVersion,'2026-09-12-v1');
});
test('zero evaluable responses produce no fabricated zero-percent score',async()=>{
 const h=setup();const r=await h.summary();assert.equal(r.scopes.length,2);for(const s of r.scopes){assert.equal(s.starts,0);assert.equal(s.helpedShare,null);}
});
test('only admins can access aggregate or other users feedback',async()=>{
 const h=setup(),admin=h.load('app/api/admin/route.ts');h.user(null);assert.equal((await h.call(admin.GET,null,'GET')).status,401);h.user(alpha);assert.equal((await h.call(admin.GET,null,'GET')).status,403);h.env.ADMIN_USER_IDS='alpha';const r=await h.call(admin.GET,null,'GET');assert.equal(r.status,200);assert.equal(r.data.feedback.scopes.length,2);
});
test('account export includes only owned feedback and no recovery hashes',async()=>{
 const h=setup(),s=randomUUID();await h.feedback(request(s));await h.feedback(request(s,'answer','information',{answer:'partly',comment:'owned'}));h.user(beta);await h.feedback(request(s));h.user(null);await h.feedback(request(s));h.user(alpha);
 const r=await h.call(h.load('app/api/export/route.ts').GET,null,'GET');assert.equal(r.status,200);assert.equal(r.data.feedback.length,1);assert.equal(r.data.feedback[0].comment,'owned');assert.ok(!JSON.stringify(r.data.feedback).includes('session_hash'));assert.ok(!JSON.stringify(r.data.feedback).includes('user_id'));
});
test('whole-account deletion erases owned feedback and preserves guest and other-account records',async()=>{
 const h=setup(),s=randomUUID();await h.feedback(request(s));h.user(beta);await h.feedback(request(s));h.user(null);await h.feedback(request(s));h.user(alpha);assert.equal((await h.call(h.workspace.DELETE,{confirmation:'내 기록 삭제'},'DELETE')).status,200);
 assert.equal(h.sql.prepare("SELECT COUNT(*) n FROM feedback_sessions WHERE user_id='alpha'").get().n,0);assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM feedback_sessions').get().n,2);
});
