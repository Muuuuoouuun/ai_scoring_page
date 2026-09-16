import {feedbackFields} from '@/lib/feedback';
import {emailReceiptFields} from '@/lib/email-status';
import {authenticated,failure} from '@/lib/http';
import {rows,now} from '@/lib/db';
export async function GET(){try{
 const u=await authenticated();
 const [records,posts,notifications,feedback,deliveries,emailOutbox,emailSchedule,notificationCards]=await Promise.all([
  rows<{payload:string}>('SELECT id,kind,target,payload,created_at,updated_at FROM private_records WHERE user_id=?',u.userId),
  rows('SELECT id,author,kind,tool_id,parent_id,title,body,task,plan,used_at,affiliation,ratings,status,created_at,updated_at FROM posts WHERE user_id=?',u.userId),
  rows('SELECT id,source_key,metadata,title,body,href,read,created_at FROM notifications WHERE user_id=?',u.userId),
  rows(`SELECT ${feedbackFields} FROM feedback_sessions WHERE user_id=?`,u.userId),
  rows<{items:string}>(`SELECT ${emailReceiptFields},items FROM email_deliveries WHERE user_id=? ORDER BY created_at`,u.userId),
  rows('SELECT id,notification_id,delivery_id,status,attempts,created_at,sent_at,provider_id,error FROM email_outbox WHERE user_id=?',u.userId),
  rows('SELECT next_digest_not_before,last_digest_date,last_digest_outcome,updated_at FROM email_dispatch_state WHERE user_id=?',u.userId),
  rows('SELECT id,card_key,latest_notification_id,source_version,source_revision,snapshot,status,email_reason,read,created_at,updated_at,legacy_baseline_version FROM notification_cards WHERE user_id=?',u.userId),
 ]);
 return new Response(JSON.stringify({exportedAt:now(),records:records.map(r=>({...r,payload:JSON.parse(r.payload)})),posts,notifications,notificationCards,feedback,emailDeliveries:deliveries.map(d=>({...d,items:JSON.parse(d.items)})),emailOutbox,emailSchedule},null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="ais-my-records.json"','Cache-Control':'no-store'}});
}catch(e){return failure(e);}}
