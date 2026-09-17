import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {harness} from '/Users/bigmac_moon/dev/ai_score/site/tests/api-harness.mjs';

// Read-only reproduction: real API modules and migrations, SQLite :memory: only.
const NativeDate=globalThis.Date,at='2026-09-12T12:30:00.000Z';
class FixedDate extends NativeDate{constructor(...a){super(...(a.length?a:[at]));}static now(){return NativeDate.parse(at);}}
globalThis.Date=FixedDate;
const fixture=()=>{const h=harness(),api=h.load('app/api/feedback/route.ts').POST;return {...h,send:(session,action='start',scope='information',extra={})=>h.call(api,{session,scope,action,...(action==='start'?{context:'home'}:{}),...extra}),summary:()=>h.load('lib/feedback.ts').feedbackSummary()};};
let n=0;
try{
 {
 const h=fixture(),s=randomUUID();await h.send(s);h.sql.prepare('UPDATE feedback_sessions SET started_at=?').run('2026-08-12T12:30:00.000Z');await h.send(s);await h.send(s,'answer','information',{answer:'helped',comment:'edited today'});assert.equal(h.sql.prepare('SELECT started_at FROM feedback_sessions').get().started_at,'2026-08-12T12:30:00.000Z');assert.equal((await h.summary()).scopes[0].starts,0);n++;console.log('PASS old cohort remains outside after reopen+answer');
 }
 {
 const h=fixture();for(const answer of ['not_tried','not_tried','undecided']){const s=randomUUID();await h.send(s);await h.send(s,'answer','information',{answer});}const i=(await h.summary()).scopes[0];assert.deepEqual([i.starts,i.answers,i.unanswered,i.evaluable,i.helpedShare],[3,3,0,0,null]);n++;console.log('PASS answered but no evaluable responses => null, not0');
 }
 {
 const h=fixture(),s=randomUUID();for(const u of [null,{userId:'alpha',email:'a@example.invalid'},{userId:'beta',email:'b@example.invalid'}]){h.user(u);await h.send(s);}h.user({userId:'alpha',email:'a@example.invalid'});await h.send(s,'start','personal');await h.send(s,'delete');assert.equal(h.sql.prepare("SELECT COUNT(*) n FROM feedback_sessions WHERE user_id='alpha' AND scope='information'").get().n,0);assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM feedback_sessions').get().n,3);n++;console.log('PASS exact actor+scope deletion preserves guest,beta,alpha personal');
 }
 {
 const h=fixture();for(const stamp of ['2026-08-13T12:29:59.999Z','2026-08-13T12:30:00.000Z','2026-09-12T12:30:00.000Z','2026-09-12T12:30:00.001Z']){const s=randomUUID(),r=await h.send(s);h.sql.prepare('UPDATE feedback_sessions SET started_at=? WHERE id=?').run(stamp,r.data.record.id);}const i=(await h.summary()).scopes[0];assert.equal(i.starts,2);n++;console.log('PASS exact UTC cutoff inclusive/current inclusive/outside+future excluded');
 }
 {
 const h=fixture(),s=randomUUID();await h.send(s);await h.send(s,'answer','information',{answer:'helped'});h.sql.prepare('UPDATE feedback_sessions SET question_version=?').run('older-version');assert.equal((await h.summary()).scopes[0].starts,0);const exp=await h.call(h.load('app/api/export/route.ts').GET,null,'GET');assert.equal(exp.data.feedback.length,1);assert.equal(exp.data.feedback[0].question_version,'older-version');n++;console.log('PASS past version excluded from current metric but retained in own export');
 }
 {
 const h=fixture(),s=randomUUID(),comment="<img src=x onerror=alert(1)>');DELETE FROM feedback_sessions;--";await h.send(s);await h.send(s,'answer','information',{answer:'partly',comment});h.env.ADMIN_USER_IDS='alpha';const res=await h.call(h.load('app/api/admin/route.ts').GET,null,'GET');assert.equal(res.status,200);assert.equal(res.data.feedback.recent[0].comment,comment);const str=JSON.stringify(res.data.feedback);for(const secret of ['session_hash','user_id',s])assert.ok(!str.includes(secret));assert.equal(h.sql.prepare('SELECT COUNT(*) n FROM feedback_sessions').get().n,1);n++;console.log('PASS comment stays parameterized data,admin feedback exposes no raw token/hash/account ID');
 }
 console.log('Independent memory/API cases passed:',n);
}finally{globalThis.Date=NativeDate;}
