import {db,one,id,now} from './db';
import {currentNotices} from './notice-candidates';
import {sourceGuard,currentItemsGuard} from './notice-sources';
export {currentNotices} from './notice-candidates';
export {deliverEmailForUser} from './email-delivery';
export async function generateNotifications(userId:string){
 const {settings:s,settingsId,settingsRevision,notices}=await currentNotices(userId);let created=0;
 const settingsGuard="EXISTS (SELECT 1 FROM private_records WHERE id=? AND user_id=? AND kind='settings' AND target='preferences' AND COALESCE(json_extract(payload,'$.emailRevision'),'')=?)";
 const settingsArgs=[settingsId,userId,settingsRevision];
 for(const n of notices){
  if(!settingsId&&!n.personalRecord)continue;
  if(!n.headValid||(!n.prior&&!n.legacyId&&((!s.inApp&&!(s.email&&n.emailAllowed))||n.retainedOnly)))continue;
  const source=sourceGuard(n),guard=(settingsId?settingsGuard:"NOT EXISTS (SELECT 1 FROM private_records WHERE user_id=? AND kind='settings' AND target='preferences')")+' AND '+source.sql+(n.personalRecord?` AND EXISTS (SELECT 1 FROM private_records WHERE id=? AND user_id=? AND kind='subscription' AND payload=?)`:''),args=[...(settingsId?settingsArgs:[userId]),...source.args,...(n.personalRecord?[n.personalRecord.id,userId,n.personalRecord.payload]:[])];
  const noticeId=id(),stamp=now(),cardId=n.prior?.id||n.legacyId||noticeId;
  const metadata=JSON.stringify({cardKey:n.cardKey,version:n.version,revision:n.revision,material:n.material,correction:n.title.startsWith('정정 · '),correctionBaseline:n.correctionBaseline,emailNotAfter:n.emailNotAfter});
  const cas=n.prior?'EXISTS (SELECT 1 FROM notification_cards WHERE id=? AND user_id=? AND latest_notification_id=? AND source_version=? AND source_revision=?)':'NOT EXISTS (SELECT 1 FROM notification_cards WHERE user_id=? AND card_key=?)';
  const casArgs=n.prior?[n.prior.id,userId,n.prior.latest_notification_id,n.prior.source_version,n.prior.source_revision]:[userId,n.cardKey];
  const selected='(SELECT id FROM notifications WHERE user_id=? AND source_key=?)';
  const result=await db().batch([
   db().prepare(`INSERT OR IGNORE INTO notifications(id,user_id,source_key,title,body,href,metadata,read,created_at) SELECT ?,?,?,?,?,?,?,0,? WHERE ${guard} AND ${cas}`).bind(noticeId,userId,n.key,n.title,n.body,n.href,metadata,stamp,...args,...casArgs),
   n.prior?db().prepare(`UPDATE notification_cards SET latest_notification_id=${selected},source_version=?,source_revision=?,snapshot=?,status=?,email_reason=?,legacy_baseline_version=?,read=CASE WHEN source_version=? THEN read ELSE 0 END,updated_at=CASE WHEN source_version=? THEN updated_at ELSE ? END WHERE id=? AND ${guard} AND ${cas} AND EXISTS (SELECT 1 FROM notifications WHERE user_id=? AND source_key=?)`).bind(userId,n.key,n.version,n.revision,JSON.stringify(n.material),n.status,n.holds.join(' · '),n.legacyBaseline,n.version,n.version,stamp,cardId,...args,...casArgs,userId,n.key):
   db().prepare(`INSERT OR IGNORE INTO notification_cards(id,user_id,card_key,hide_topic,latest_notification_id,source_version,source_revision,snapshot,status,email_reason,legacy_baseline_version,read,created_at,updated_at) SELECT ?,?,?,?,${selected},?,?,?,?,?,?,0,?,? WHERE ${guard} AND ${cas} AND EXISTS (SELECT 1 FROM notifications WHERE user_id=? AND source_key=?)`).bind(cardId,userId,n.cardKey,n.topic,userId,n.key,n.version,n.revision,JSON.stringify(n.material),n.status,n.holds.join(' · '),n.legacyBaseline,stamp,stamp,...args,...casArgs,userId,n.key),
  ]);
  if(result[1].meta.changes&&!n.prior)created++;
  const existing=await one<{id:string}>('SELECT n.id FROM notifications n JOIN notification_cards c ON c.latest_notification_id=n.id AND c.user_id=n.user_id WHERE c.user_id=? AND c.card_key=? AND n.source_key=?',userId,n.cardKey,n.key);
  if(s.email&&s.emailAddress&&n.emailAllowed&&existing){
   const active=currentItemsGuard(userId,[{notificationId:existing.id,key:n.key}]);
   const emailGuard=guard+" AND EXISTS (SELECT 1 FROM private_records WHERE id=? AND json_extract(payload,'$.email')=1) AND "+active.sql,emailArgs=[...args,settingsId,...active.args];
   await db().batch([
    db().prepare(`INSERT OR IGNORE INTO email_outbox(id,user_id,notification_id,status,attempts,created_at) SELECT ?,?,?,'queued',0,? WHERE ${emailGuard}`).bind(id(),userId,existing.id,stamp,...emailArgs),
    db().prepare(`UPDATE email_outbox SET status='queued',delivery_id=NULL,error=NULL WHERE user_id=? AND notification_id=? AND status='cancelled' AND attempts=0 AND ${emailGuard}`).bind(userId,existing.id,...emailArgs),
   ]);
  }
 }
 return {created};
}
