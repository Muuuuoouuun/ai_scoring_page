import {env} from 'cloudflare:workers';
import {db,rows,one,id,now} from './db';
import {currentNotices} from './notice-candidates';
import {sourceGuard,currentItemsGuard} from './notice-sources';
import {emailSchedule,emailWindow} from './email-timing';

const HOUR=3600000;
type Current=Awaited<ReturnType<typeof currentNotices>>;
type Claim={userId:string;token:string;settingsId:string;revision:string};
type DispatchState={next_digest_not_before:string|null};
type Item={outboxId:string;notificationId:string;key:string;title:string;body:string;href:string};
type Delivery={id:string;user_id:string;settings_id:string;settings_revision:string;mode:'digest'|'matched';time_zone:string;local_time:string;local_date:string;items:string;payload:string;status:string;attempts:number;first_attempt_at:string|null;next_attempt_at:string|null;cancel_requested_at:string|null};
const config=()=>env as unknown as Record<string,string>;
export const emailConfigured=()=>Boolean(config().RESEND_API_KEY&&config().EMAIL_FROM&&config().SITE_URL);
const statement=(sql:string,...args:unknown[])=>db().prepare(sql).bind(...args);

// Every statement after a CAS must carry its own guard: D1 batch does not abort on zero rows.
function authority(c:Claim){return {
 sql:"EXISTS (SELECT 1 FROM email_dispatch_state es JOIN private_records pr ON pr.user_id=es.user_id WHERE es.user_id=? AND es.claim_token=? AND es.lease_until>? AND pr.id=? AND pr.kind='settings' AND pr.target='preferences' AND COALESCE(json_extract(pr.payload,'$.emailRevision'),'')=? AND json_extract(pr.payload,'$.email')=1 AND json_extract(pr.payload,'$.emailTimingConfirmed')=1)",
 args:[c.userId,c.token,now(),c.settingsId,c.revision],
};}
function sourceAuthority(c:Claim,current:Current){
 const g=authority(c),sources=current.notices.map(sourceGuard);
 return {sql:g.sql+(sources.length?' AND '+sources.map(s=>s.sql).join(' AND '):''),args:[...g.args,...sources.flatMap(s=>s.args)]};
}
async function claim(userId:string,current:Current):Promise<Claim|null>{
 if(!current.settingsId||!current.settings.email||!current.settings.emailTimingConfirmed||!current.settings.emailAddress)return null;
 const c={userId,token:id(),settingsId:current.settingsId,revision:current.settingsRevision},stamp=now();
 const result=await statement(`INSERT INTO email_dispatch_state(user_id,claim_token,lease_until,updated_at)
 SELECT ?,?,?,? WHERE EXISTS (SELECT 1 FROM private_records WHERE id=? AND user_id=? AND COALESCE(json_extract(payload,'$.emailRevision'),'')=? AND json_extract(payload,'$.email')=1 AND json_extract(payload,'$.emailTimingConfirmed')=1)
 ON CONFLICT(user_id) DO UPDATE SET claim_token=excluded.claim_token,lease_until=excluded.lease_until,updated_at=excluded.updated_at WHERE email_dispatch_state.lease_until<=?`,userId,c.token,new Date(Date.now()+5*60000).toISOString(),stamp,c.settingsId,userId,c.revision,stamp).run();
 return result.meta.changes?c:null;
}
async function dropBatch(c:Claim,d:Delivery,reason:string){
 const current=await currentNotices(c.userId);if(current.notices.some(n=>!n.headValid))return;
 const g=sourceAuthority(c,current),status=d.attempts?'needs_review':'cancelled';
 const keys=new Set(current.notices.filter(n=>n.emailAllowed).map(n=>n.key));
 const survivors=d.attempts?[]:(JSON.parse(d.items) as Item[]).filter(item=>keys.has(item.key));
 await db().batch([
  statement(`UPDATE email_deliveries SET status=?,error=? WHERE id=? AND user_id=? AND status NOT IN ('accepted','needs_review','cancelled') AND ${g.sql}`,status,reason,d.id,c.userId,...g.args),
  statement(`UPDATE email_outbox SET status=?,error=? WHERE user_id=? AND delivery_id=? AND status!='sent' AND ${g.sql} AND EXISTS (SELECT 1 FROM email_deliveries WHERE id=? AND user_id=? AND status=?)`,status,reason,c.userId,d.id,...g.args,d.id,c.userId,status),
  ...survivors.map(item=>statement(`UPDATE email_outbox SET status='queued',delivery_id=NULL,error=NULL WHERE id=? AND user_id=? AND delivery_id=? AND status='cancelled' AND attempts=0 AND ${g.sql} AND EXISTS (SELECT 1 FROM email_deliveries WHERE id=? AND user_id=? AND status='cancelled' AND attempts=0)`,item.outboxId,c.userId,d.id,...g.args,d.id,c.userId)),
 ]);
}
async function quota(userId:string){
 const lower=new Date(Date.now()-24*HOUR).toISOString();
 return rows<{first_attempt_at:string}>("SELECT first_attempt_at FROM email_deliveries WHERE user_id=? AND first_attempt_at>? AND first_attempt_at<=? ORDER BY first_attempt_at",userId,lower,now());
}
function matches(d:Delivery,current:Current){
 const items=JSON.parse(d.items) as Item[],payload=JSON.parse(d.payload) as {to:string[]};
 const keys=new Set(current.notices.filter(n=>n.emailAllowed).map(n=>n.key));
 return current.settings.email&&current.settings.emailTimingConfirmed&&payload.to.length===1&&payload.to[0]===current.settings.emailAddress&&items.length>0&&items.every(item=>keys.has(item.key));
}
async function digestConsumed(c:Claim,window:ReturnType<typeof emailWindow>,outcome:string,current:Current){
 const g=sourceAuthority(c,current);
 await statement(`UPDATE email_dispatch_state SET next_digest_not_before=MAX(COALESCE(next_digest_not_before,''),?),last_digest_date=?,last_digest_outcome=?,updated_at=? WHERE user_id=? AND ${g.sql}`,window.nextDigestNotBefore,window.localDate,outcome,now(),c.userId,...g.args).run();
}
async function planBatch(c:Claim,current:Current):Promise<Delivery|null>{
 if(current.notices.some(n=>!n.headValid))return null;
 const schedule=emailSchedule(current.settings),state=await one<DispatchState>('SELECT next_digest_not_before FROM email_dispatch_state WHERE user_id=?',c.userId);
 const window=emailWindow(now(),schedule,state?.next_digest_not_before);
 if(!window.eligible)return null;
 if(schedule.mode==='matched'&&(await quota(c.userId)).length>=3)return null;
 const pending=await rows<{id:string;notification_id:string;source_key:string}>("SELECT o.id,o.notification_id,n.source_key FROM email_outbox o JOIN notifications n ON n.id=o.notification_id AND n.user_id=o.user_id WHERE o.user_id=? AND o.status='queued' AND o.attempts=0 AND o.delivery_id IS NULL ORDER BY n.source_key LIMIT 100",c.userId);
 const available=new Map(current.notices.filter(n=>n.emailAllowed).map(n=>[n.key,n])),items:Item[]=[];
 const g=sourceAuthority(c,current);
 for(const row of pending){
  const notice=available.get(row.source_key);
  if(notice)items.push({outboxId:row.id,notificationId:row.notification_id,key:notice.key,title:notice.title,body:notice.body,href:notice.href});
  else await statement(`UPDATE email_outbox SET status='cancelled',error='Notice is no longer eligible' WHERE id=? AND user_id=? AND status='queued' AND attempts=0 AND ${g.sql}`,row.id,c.userId,...g.args).run();
 }
 if(!items.length){if(schedule.mode==='digest')await digestConsumed(c,window,'evaluated_empty',current);return null;}
 const deliveryId=id(),e=config(),stamp=now();
 const payload=JSON.stringify({from:e.EMAIL_FROM,to:[current.settings.emailAddress],subject:schedule.mode==='digest'?'[AIs] 새 소식 요약':'[AIs] 관심 서비스의 새 소식',text:items.map(item=>`${item.title}\n${item.body}\n내용 보기: ${e.SITE_URL}${item.href}`).join('\n\n')+`\n\n수신 설정 변경: ${e.SITE_URL}/my?tab=settings`});
 const itemGuard=currentItemsGuard(c.userId,items);
 const result=await db().batch([
  statement(`INSERT INTO email_deliveries(id,user_id,settings_id,settings_revision,mode,time_zone,local_time,local_date,items,payload,status,attempts,created_at) SELECT ?,?,?,?,?,?,?,?,?,?,'prepared',0,? WHERE ${g.sql} AND ${itemGuard.sql}`,deliveryId,c.userId,c.settingsId,c.revision,schedule.mode,schedule.timeZone,schedule.time,window.localDate,JSON.stringify(items),payload,stamp,...g.args,...itemGuard.args),
  ...items.map(item=>statement(`UPDATE email_outbox SET delivery_id=?,status='prepared',error=NULL WHERE id=? AND user_id=? AND status='queued' AND attempts=0 AND delivery_id IS NULL AND ${g.sql} AND EXISTS (SELECT 1 FROM email_deliveries WHERE id=? AND user_id=? AND status='prepared')`,deliveryId,item.outboxId,c.userId,...g.args,deliveryId,c.userId)),
 ]);
 if(!result[0].meta.changes)return null;
 // An unexpected lost item is not safe to send. The immutable snapshot remains reviewable.
 if(result.slice(1).some(r=>r.meta.changes!==1)){
  const d=await one<Delivery>('SELECT * FROM email_deliveries WHERE id=? AND user_id=?',deliveryId,c.userId);if(d)await dropBatch(c,d,'Queue reservation changed');return null;
 }
 return one<Delivery>('SELECT * FROM email_deliveries WHERE id=? AND user_id=?',deliveryId,c.userId);
}
async function finish(c:Claim,d:Delivery,attemptToken:string,status:'accepted'|'retryable'|'needs_review',error:string|null,providerId:string|null,nextAttemptAt:string|null){
 const stamp=now();
 const result=await db().batch([
  statement(`UPDATE email_deliveries SET status=CASE WHEN ?='retryable' AND cancel_requested_at IS NOT NULL THEN 'needs_review' ELSE ? END,error=?,provider_id=COALESCE(?,provider_id),accepted_at=CASE WHEN ?='accepted' THEN ? ELSE accepted_at END,next_attempt_at=? WHERE id=? AND user_id=? AND status='sending' AND attempt_token=? AND EXISTS (SELECT 1 FROM email_dispatch_state WHERE user_id=? AND claim_token=?)`,status,status,error,providerId,status,stamp,nextAttemptAt,d.id,c.userId,attemptToken,c.userId,c.token),
  statement(`UPDATE email_outbox SET status=(SELECT CASE status WHEN 'accepted' THEN 'sent' WHEN 'retryable' THEN 'failed' ELSE status END FROM email_deliveries WHERE id=?),error=?,provider_id=COALESCE(?,provider_id),sent_at=CASE WHEN ?='accepted' THEN ? ELSE sent_at END WHERE user_id=? AND delivery_id=? AND status!='sent' AND EXISTS (SELECT 1 FROM email_deliveries d JOIN email_dispatch_state es ON es.user_id=d.user_id WHERE d.id=? AND d.user_id=? AND d.attempt_token=? AND d.status IN ('accepted','retryable','needs_review') AND es.claim_token=?)`,d.id,error,providerId,status,stamp,c.userId,d.id,d.id,c.userId,attemptToken,c.token),
 ]);
 return result[0].meta.changes===1;
}
async function acceptReceipt(c:Claim,d:Delivery,providerId:string){
 // Success is monotonic evidence about this exact immutable request, even after lease replacement.
 // Only existing rows are updated, so account deletion cannot be undone by a late response.
 const stamp=now();
 const result=await db().batch([
  statement("UPDATE email_deliveries SET status='accepted',provider_id=?,accepted_at=?,next_attempt_at=NULL,error=NULL WHERE id=? AND user_id=? AND payload=? AND first_attempt_at IS NOT NULL AND status!='accepted'",providerId,stamp,d.id,c.userId,d.payload),
  statement("UPDATE email_outbox SET status='sent',provider_id=?,sent_at=?,error=NULL WHERE user_id=? AND delivery_id=? AND status!='sent' AND EXISTS (SELECT 1 FROM email_deliveries WHERE id=? AND user_id=? AND payload=? AND status='accepted' AND provider_id=?)",providerId,stamp,c.userId,d.id,d.id,c.userId,d.payload,providerId),
 ]);
 return result[0].meta.changes===1;
}
async function retainKnownReceipt(c:Claim,d:Delivery,providerId:string){
 // A known successful response must survive even if recording acceptance failed after lease loss.
 await db().batch([
  statement("UPDATE email_deliveries SET status='needs_review',provider_id=COALESCE(provider_id,?),next_attempt_at=NULL,error='Acceptance receipt could not be committed' WHERE id=? AND user_id=? AND payload=? AND first_attempt_at IS NOT NULL AND status!='accepted'",providerId,d.id,c.userId,d.payload),
  statement("UPDATE email_outbox SET status='needs_review',provider_id=COALESCE(provider_id,?),error='Acceptance receipt could not be committed' WHERE user_id=? AND delivery_id=? AND status!='sent' AND EXISTS (SELECT 1 FROM email_deliveries WHERE id=? AND user_id=? AND payload=? AND status='needs_review' AND provider_id=?)",providerId,c.userId,d.id,d.id,c.userId,d.payload,providerId),
 ]);
}
async function attempt(c:Claim,d:Delivery){
 const current=await currentNotices(c.userId);
 // A new revision can be authorized only after all current conditions are re-evaluated.
 if(current.settingsId!==c.settingsId||current.notices.some(n=>!n.headValid))return 0;
 c.revision=current.settingsRevision;
 if(!matches(d,current)){
  if(current.settings.email&&current.settings.emailTimingConfirmed)await dropBatch(c,d,'Consent, recipient or notice conditions changed');
  return 0;
 }
 if(d.attempts>=3||(d.first_attempt_at&&Date.now()-Date.parse(d.first_attempt_at)>=23*HOUR)){await dropBatch(c,d,'Retry limit or safe idempotency window elapsed');return 0;}
 if(d.next_attempt_at&&Date.parse(d.next_attempt_at)>Date.now())return 0;
 const schedule=emailSchedule(current.settings),window=emailWindow(now(),schedule);
 if(!window.eligible)return 0;
 const first=!d.first_attempt_at;
 if(first){
  const state=await one<DispatchState>('SELECT next_digest_not_before FROM email_dispatch_state WHERE user_id=?',c.userId);
  if(!emailWindow(now(),schedule,state?.next_digest_not_before).eligible)return 0;
  if(schedule.mode==='matched'&&(await quota(c.userId)).length>=3)return 0;
 }
 const g=authority(c),token=id(),stamp=now(),lower=new Date(Date.now()-24*HOUR).toISOString();
 const itemGuard=currentItemsGuard(c.userId,JSON.parse(d.items));
 const writes=[
  statement(`UPDATE email_deliveries SET status='sending',attempt_token=?,attempts=attempts+1,first_attempt_at=COALESCE(first_attempt_at,?),last_attempt_at=?,next_attempt_at=NULL,error=NULL WHERE id=? AND user_id=? AND status IN ('prepared','retryable','sending') AND cancel_requested_at IS NULL AND attempts<3 AND (first_attempt_at IS NULL OR first_attempt_at>?) AND (next_attempt_at IS NULL OR next_attempt_at<=?) AND ${g.sql} AND ${itemGuard.sql} AND (first_attempt_at IS NOT NULL OR ?!='matched' OR (SELECT COUNT(*) FROM email_deliveries WHERE user_id=? AND first_attempt_at>? AND first_attempt_at<=?)<3)`,token,stamp,stamp,d.id,c.userId,new Date(Date.now()-23*HOUR).toISOString(),stamp,...g.args,...itemGuard.args,schedule.mode,c.userId,lower,stamp),
  statement(`UPDATE email_outbox SET status='sending',attempts=attempts+1,error=NULL WHERE user_id=? AND delivery_id=? AND status NOT IN ('sent','needs_review','cancelled') AND ${g.sql} AND EXISTS (SELECT 1 FROM email_deliveries WHERE id=? AND user_id=? AND status='sending' AND attempt_token=?)`,c.userId,d.id,...g.args,d.id,c.userId,token),
 ];
 if(first&&schedule.mode==='digest')writes.push(statement(`UPDATE email_dispatch_state SET next_digest_not_before=MAX(COALESCE(next_digest_not_before,''),?),last_digest_date=?,last_digest_outcome='attempted',updated_at=? WHERE user_id=? AND ${g.sql} AND EXISTS (SELECT 1 FROM email_deliveries WHERE id=? AND user_id=? AND status='sending' AND attempt_token=?)`,window.nextDigestNotBefore,window.localDate,stamp,c.userId,...g.args,d.id,c.userId,token));
 const claimed=await db().batch(writes);if(!claimed[0].meta.changes)return 0;
 let providerId:string|null=null;
 try{
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+config().RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'ais-delivery-'+d.id},body:d.payload,signal:AbortSignal.timeout(15000)});
  if(!response.ok){
   const retryable=response.status===408||response.status===429||response.status>=500;
   const raw=response.headers.get('Retry-After'),seconds=raw&&/^\d+$/.test(raw)?Number(raw):null;
   const retryAt=seconds!==null?Date.now()+seconds*1000:raw?Date.parse(raw):NaN;
   const backoff=Date.now()+60000*2**d.attempts;
   const next=new Date(Math.max(backoff,Number.isFinite(retryAt)?Math.min(retryAt,Date.now()+23*HOUR):backoff)).toISOString();
   await finish(c,d,token,retryable&&d.attempts+1<3?'retryable':'needs_review','Email provider HTTP '+response.status,null,next);return 0;
  }
  const data=await response.json() as {id?:unknown};
  if(typeof data.id!=='string'||!data.id||data.id.length>300)throw new Error('Email provider missing acceptance ID');
  providerId=data.id;
  return await acceptReceipt(c,d,providerId)?1:0;
 }catch{
  // The provider may have accepted before a timeout or DB failure. Keep the same identity.
  if(providerId)await retainKnownReceipt(c,d,providerId);
  else await finish(c,d,token,d.attempts+1>=3?'needs_review':'retryable','Provider response is uncertain',null,new Date(Date.now()+60000*2**d.attempts).toISOString());
  return 0;
 }
}
export async function deliverEmailForUser(userId:string){
 if(!emailConfigured())return {sent:0,configured:false};
 const current=await currentNotices(userId);if(current.notices.some(n=>!n.headValid))return {sent:0,configured:true};
 const c=await claim(userId,current);if(!c)return {sent:0,configured:true};
 try{
  const g=authority(c);
  await statement(`UPDATE email_outbox SET status='needs_review',error='Legacy attempt has no immutable delivery snapshot' WHERE user_id=? AND delivery_id IS NULL AND attempts>0 AND status IN ('queued','failed','sending') AND ${g.sql}`,userId,...g.args).run();
  const pending=await rows<Delivery>("SELECT * FROM email_deliveries WHERE user_id=? AND status IN ('prepared','retryable','sending') ORDER BY created_at LIMIT 10",userId);
  for(const d of pending){
   if(matches(d,current)&&!d.cancel_requested_at)return {sent:await attempt(c,d),configured:true};
   await dropBatch(c,d,'Current conditions no longer permit retry');
  }
  const d=await planBatch(c,current);return {sent:d?await attempt(c,d):0,configured:true};
 }finally{
  await statement('UPDATE email_dispatch_state SET claim_token=NULL,lease_until=?,updated_at=? WHERE user_id=? AND claim_token=?',now(),now(),userId,c.token).run();
 }
}
