import {rows,one,now} from './db';
import {currentNotices} from './notice-candidates';
import {emailConfigured} from './email-delivery';
import {emailSchedule,emailWindow} from './email-timing';

export const emailReceiptFields='id,mode,time_zone,local_time,local_date,status,attempts,created_at,first_attempt_at,last_attempt_at,next_attempt_at,accepted_at,provider_id,cancel_requested_at,error';
type Receipt={id:string;mode:string;time_zone:string;local_time:string;local_date:string;status:string;attempts:number;created_at:string;first_attempt_at:string|null;last_attempt_at:string|null;next_attempt_at:string|null;accepted_at:string|null;provider_id:string|null;cancel_requested_at:string|null;error:string|null};
export type EmailStatus={configured:boolean;enabled:boolean;timingConfirmed:boolean;processing:'on_refresh';mode:'digest'|'matched';timeZone:string;time:string;state:string;nextEligibleAt:string|null;reviewCount:number;pendingCount:number;recent:Receipt[];lastDigestOutcome:string|null};
export async function emailStatus(userId:string):Promise<EmailStatus>{
 const {settings}=await currentNotices(userId),schedule=emailSchedule(settings),configured=emailConfigured();
 const [state,recent,counts,attempts]=await Promise.all([
  one<{next_digest_not_before:string|null;last_digest_outcome:string|null}>('SELECT next_digest_not_before,last_digest_outcome FROM email_dispatch_state WHERE user_id=?',userId),
  rows<Receipt>(`SELECT ${emailReceiptFields} FROM email_deliveries WHERE user_id=? ORDER BY created_at DESC,id LIMIT 10`,userId),
  rows<{status:string;count:number}>('SELECT status,COUNT(*) count FROM email_outbox WHERE user_id=? GROUP BY status',userId),
  rows<{first_attempt_at:string}>('SELECT first_attempt_at FROM email_deliveries WHERE user_id=? AND first_attempt_at>? AND first_attempt_at<=? ORDER BY first_attempt_at',userId,new Date(Date.now()-24*3600000).toISOString(),now()),
 ]);
 const result:EmailStatus={configured,enabled:settings.email,timingConfirmed:settings.emailTimingConfirmed===true,processing:'on_refresh',...schedule,state:'off',nextEligibleAt:null,reviewCount:counts.find(c=>c.status==='needs_review')?.count||0,pendingCount:counts.filter(c=>['queued','prepared','sending','failed'].includes(c.status)).reduce((n,c)=>n+c.count,0),recent,lastDigestOutcome:state?.last_digest_outcome||null};
 if(!configured){result.state='transport_unconfigured';return result;}
 if(!settings.email)return result;
 if(!settings.emailTimingConfirmed){result.state='timing_required';return result;}
 const pending=await one<Receipt>(`SELECT ${emailReceiptFields} FROM email_deliveries WHERE user_id=? AND status IN ('prepared','retryable','sending') ORDER BY created_at LIMIT 1`,userId);
 let minimum=Date.now();const guard=pending?.first_attempt_at?null:state?.next_digest_not_before;
 if(pending?.next_attempt_at)minimum=Math.max(minimum,Date.parse(pending.next_attempt_at));
 if(!pending?.first_attempt_at&&schedule.mode==='matched'&&attempts.length>=3)minimum=Math.max(minimum,Date.parse(attempts[attempts.length-3].first_attempt_at)+24*3600000);
 const window=emailWindow(minimum,schedule,guard),next=window.eligible?minimum:Date.parse(window.nextEligibleAt);
 result.nextEligibleAt=new Date(next).toISOString();
 result.state=pending?.status==='sending'?'processing':next<=Date.now()?'ready':pending?.next_attempt_at&&Date.parse(pending.next_attempt_at)>Date.now()?'retry_wait':schedule.mode==='matched'&&attempts.length>=3?'quota_wait':'waiting';
 return result;
}
