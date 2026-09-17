import {db,id,now,one,rows} from './db';
import {ApiError} from './http';
import {feedbackVersion,feedbackScopes,type FeedbackAnswer,type FeedbackContext,type FeedbackScope,type FeedbackRecord,type FeedbackCounts,type FeedbackSummary} from './feedback-config';
export const feedbackFields='id,scope,question_version,context,answer,comment,started_at,answered_at,updated_at';
async function sessionHash(session:string,userId:string|null){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([session,userId])));return Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,'0')).join('');}
export async function feedbackRecord(userId:string|null,p:{session:string;scope:FeedbackScope;action:'start'|'answer'|'delete';context?:FeedbackContext;answer?:FeedbackAnswer;comment?:string}){
 const hash=await sessionHash(p.session,userId),key=[hash,p.scope,feedbackVersion];
 if(p.action==='delete'){await db().prepare('DELETE FROM feedback_sessions WHERE session_hash=? AND scope=? AND question_version=?').bind(...key).run();return {deleted:true};}
 const stamp=now();
 if(p.action==='start')await db().prepare('INSERT INTO feedback_sessions(id,session_hash,user_id,scope,question_version,context,started_at,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(session_hash,scope,question_version) DO NOTHING').bind(id(),hash,userId,p.scope,feedbackVersion,p.context!,stamp,stamp).run();
 else{const result=await db().prepare('UPDATE feedback_sessions SET answer=?,comment=?,answered_at=?,updated_at=? WHERE session_hash=? AND scope=? AND question_version=?').bind(p.answer!,p.comment||'',stamp,stamp,...key).run();if(!result.meta.changes)throw new ApiError(404,'의견 창을 다시 열어 시작해주세요. 저장된 응답은 이 요청으로 변경되지 않았습니다.');}
 const record=await one<FeedbackRecord>(`SELECT ${feedbackFields} FROM feedback_sessions WHERE session_hash=? AND scope=? AND question_version=?`,...key);
 if(!record)throw new ApiError(409,'의견 기록이 변경되었습니다. 창을 다시 열어 확인해주세요.');return {record};
}
type Group={scope:FeedbackScope;member:number;answer:FeedbackAnswer|null;count:number};
function counts(groups:Group[]):FeedbackCounts{
 const total=(answer:FeedbackAnswer|null)=>groups.filter(g=>g.answer===answer).reduce((sum,g)=>sum+g.count,0);
 const starts=groups.reduce((sum,g)=>sum+g.count,0),unanswered=total(null),helped=total('helped'),partly=total('partly'),notHelped=total('not_helped'),evaluable=helped+partly+notHelped;
 return {starts,answers:starts-unanswered,unanswered,evaluable,helped,partly,notHelped,notTried:total('not_tried'),undecided:total('undecided'),helpedShare:evaluable?helped/evaluable:null};
}
export async function feedbackSummary():Promise<FeedbackSummary>{
 const to=now(),from=new Date(Date.parse(to)-30*86400000).toISOString();
 const where='question_version=? AND started_at>=? AND started_at<=?',params=[feedbackVersion,from,to];
 const [groups,recent]=await Promise.all([
  rows<Group>(`SELECT scope,(user_id IS NOT NULL) member,answer,COUNT(*) count FROM feedback_sessions WHERE ${where} GROUP BY scope,member,answer`,...params),
  rows<FeedbackRecord&{member:number}>(`SELECT ${feedbackFields},(user_id IS NOT NULL) member FROM feedback_sessions WHERE ${where} AND answer IS NOT NULL ORDER BY answered_at DESC,id DESC LIMIT 30`,...params),
 ]);
 return {questionVersion:feedbackVersion,from,to,scopes:feedbackScopes.map(scope=>{const g=groups.filter(r=>r.scope===scope);return {scope,...counts(g),guests:counts(g.filter(r=>!r.member)),members:counts(g.filter(r=>r.member))};}),recent};
}
