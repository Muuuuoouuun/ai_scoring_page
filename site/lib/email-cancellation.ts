import {db,now} from './db';

// Included in the same D1 transaction as consent/hide changes, with the winning revision.
export function cancelEmailStatements(userId:string,reason:string,guard:string,args:unknown[],topic?:string){
 const affected=topic?"AND EXISTS (SELECT 1 FROM json_each(items) item WHERE substr(json_extract(item.value,'$.key'),1,length(?)+1)=?||':')":'';
 const topics=topic?[topic,topic]:[];
 return [
  db().prepare(`UPDATE email_deliveries SET status=CASE WHEN status='sending' THEN 'sending' WHEN attempts>0 THEN 'needs_review' ELSE 'cancelled' END,cancel_requested_at=?,error=? WHERE user_id=? AND status IN ('prepared','retryable','sending') ${affected} AND ${guard}`).bind(now(),reason,userId,...topics,...args),
  db().prepare(`UPDATE email_outbox SET status=CASE WHEN attempts>0 THEN 'needs_review' ELSE 'cancelled' END,error=? WHERE user_id=? AND status IN ('queued','prepared','failed') ${topic?"AND (EXISTS (SELECT 1 FROM notifications n WHERE n.id=notification_id AND n.user_id=email_outbox.user_id AND substr(n.source_key,1,length(?)+1)=?||':') OR EXISTS (SELECT 1 FROM email_deliveries d WHERE d.id=delivery_id AND d.user_id=email_outbox.user_id AND d.status IN ('cancelled','needs_review')))":''} AND ${guard}`).bind(reason,userId,...topics,...args),
 ];
}
