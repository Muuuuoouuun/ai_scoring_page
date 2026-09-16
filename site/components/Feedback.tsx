'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {api,useApp} from './Provider';
import Modal from './Modal';
import {feedbackAnswers,feedbackLabels,feedbackQuestions,feedbackContext,type FeedbackAnswer,type FeedbackContext,type FeedbackScope,type FeedbackRecord} from '@/lib/feedback-config';
export default function Feedback(){
 const {user}=useApp(),path=usePathname(),scope:FeedbackScope=user&&(path==='/my'||path.startsWith('/my/'))?'personal':'information';
 const token=useRef(''),[open,setOpen]=useState<{user:typeof user;scope:FeedbackScope;path:string}|null>(null);
 function show(){if(!token.current){try{token.current=sessionStorage.getItem('ais-feedback-session')||crypto.randomUUID();sessionStorage.setItem('ais-feedback-session',token.current);}catch{token.current=crypto.randomUUID();}}setOpen({user,scope,path});}
 useEffect(()=>{setOpen(current=>current&&(current.user!==user||current.path!==path)?null:current);},[user,path]);
 return <><button className="feedback-entry" onClick={show}>{feedbackQuestions[scope].label}</button>{open&&open.user===user&&open.scope===scope&&open.path===path&&<FeedbackForm session={token.current} scope={scope} context={feedbackContext(path)} member={!!user} onClose={()=>setOpen(null)}/>}</>;
}
function FeedbackForm({session,scope,context,member,onClose}:{session:string;scope:FeedbackScope;context:FeedbackContext;member:boolean;onClose:()=>void}){
 const {toast}=useApp(),[record,setRecord]=useState<FeedbackRecord|null>(null),[answer,setAnswer]=useState<FeedbackAnswer|''>(''),[comment,setComment]=useState(''),[error,setError]=useState(''),[status,setStatus]=useState(''),[busy,setBusy]=useState(true),[confirmDelete,setConfirmDelete]=useState(false);
 const alive=useRef(false),controller=useRef<AbortController|null>(null),statusRef=useRef<HTMLParagraphElement>(null),errorRef=useRef<HTMLDivElement>(null),firstChoiceRef=useRef<HTMLInputElement>(null),deleteRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(status)statusRef.current?.focus();},[status]);
 useEffect(()=>{if(error)errorRef.current?.focus();},[error]);
 useEffect(()=>{if(confirmDelete)deleteRef.current?.focus();else if(record&&document.activeElement===document.body)firstChoiceRef.current?.focus();},[confirmDelete,record]);
 function requestContext(){const active=controller.current;return {signal:active?.signal,current:()=>alive.current&&controller.current===active&&!active?.signal.aborted};}
 async function start(){const {signal,current}=requestContext();setBusy(true);setError('');try{const result=await api<{record:FeedbackRecord}>('/api/feedback',{method:'POST',signal,body:JSON.stringify({session,scope,context,action:'start'})});if(current()){setRecord(result.record);setAnswer(result.record.answer||'');setComment(result.record.comment);}}catch(e){if(current())setError(e instanceof TypeError?'연결하지 못했습니다. 입력을 유지한 채 다시 시도해주세요.':(e as Error).message);}finally{if(current())setBusy(false);}}
 useEffect(()=>{alive.current=true;const active=new AbortController();controller.current=active;void start();return()=>{alive.current=false;active.abort();};},[]);
 async function save(){if(!answer||busy)return;const {signal,current}=requestContext();setBusy(true);setError('');setStatus('');try{const result=await api<{record:FeedbackRecord}>('/api/feedback',{method:'POST',signal,body:JSON.stringify({session,scope,action:'answer',answer,comment})});if(current()){setRecord(result.record);setComment(result.record.comment);setStatus('의견을 저장했습니다. 이 창에서 수정하거나 삭제할 수 있습니다.');}}catch(e){if(current())setError(e instanceof TypeError?'연결하지 못했습니다. 입력을 유지한 채 다시 시도해주세요.':(e as Error).message);}finally{if(current())setBusy(false);}}
 async function remove(){if(busy)return;const {signal,current}=requestContext();setBusy(true);setError('');try{await api('/api/feedback',{method:'POST',signal,body:JSON.stringify({session,scope,action:'delete'})});if(current()){toast('이 의견 기록을 삭제했습니다.');onClose();}}catch(e){if(current())setError(e instanceof TypeError?'연결하지 못했습니다. 입력을 유지한 채 다시 시도해주세요.':(e as Error).message);}finally{if(current())setBusy(false);}}
 return <Modal title={feedbackQuestions[scope].label} onClose={onClose}><div className="feedback-form">
  <p className="feedback-intro">선택 사항이며 운영자에게만 전달됩니다. 창을 연 시각과 응답 여부도 함께 기록합니다.</p>
  {!record&&!error&&<p className="loading" role="status">의견 기록을 불러오고 있습니다.</p>}
  {error&&<div ref={errorRef} tabIndex={-1} className="error" role="alert">{error}{!record&&<button className="button ghost small" disabled={busy} onClick={()=>void start()}>다시 불러오기</button>}</div>}
  {record&&<form onSubmit={e=>{e.preventDefault();void save();}}>
   <fieldset className="feedback-choices" disabled={busy||confirmDelete}><legend>{feedbackQuestions[scope].question}</legend>{feedbackAnswers.map(value=><label key={value} className={'feedback-choice'+(answer===value?' chosen':'')}><input ref={value===feedbackAnswers[0]?firstChoiceRef:undefined} type="radio" name="feedback-answer" value={value} checked={answer===value} required onChange={()=>{setAnswer(value);setStatus('');}}/>{feedbackLabels[value]}</label>)}</fieldset>
   <label className="field">구체적인 의견 <small>선택 · 1,000자 이내</small><textarea value={comment} rows={3} maxLength={1000} disabled={busy||confirmDelete} onChange={e=>{setComment(e.target.value);setStatus('');}} aria-describedby="feedback-private-note"/></label>
   <p id="feedback-private-note" className="feedback-privacy">연락처·계약 정보 등 민감한 내용은 적지 마세요. {member?'로그인 상태의 의견은 내 기록 내보내기와 전체 삭제에 포함됩니다.':'비회원 의견은 이 탭에서만 다시 열어 수정·삭제할 수 있습니다. 탭 저장소가 지워지면 복구할 수 없습니다.'}</p>
   <p ref={statusRef} tabIndex={-1} className="feedback-status" role="status">{status}</p>
   {confirmDelete?<div className="note warning"><p>응답과 이 창의 시작 기록을 삭제합니다.</p><div className="actions"><button ref={deleteRef} type="button" disabled={busy} className="button danger" onClick={()=>void remove()}>삭제 확인</button><button type="button" disabled={busy} className="button ghost" onClick={()=>setConfirmDelete(false)}>계속 작성</button></div></div>:<div className="actions"><button className="button primary" disabled={busy||!answer} type="submit">{busy?'저장 중…':record.answer?'의견 수정':'의견 보내기'}</button><button className="button ghost" disabled={busy} type="button" onClick={()=>setConfirmDelete(true)}>이 의견 기록 삭제</button></div>}
  </form>}
 </div></Modal>;
}
