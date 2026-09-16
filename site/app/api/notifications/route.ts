import {authenticated,input,json,failure,ApiError} from '@/lib/http';
import {rows,db,one,id,now} from '@/lib/db';
import {generateNotifications,deliverEmailForUser,currentNotices} from '@/lib/notifications';
import {emailStatus} from '@/lib/email-status';
import {cancelEmailStatements} from '@/lib/email-cancellation';
import {z} from 'zod';
export async function GET(){try{
 const u=await authenticated(),{settings,notices}=await currentNotices(u.userId);
 const email=await emailStatus(u.userId);
 const current=new Map(notices.map(n=>[n.cardKey,n]));
 const items=await rows<{card_key:string;source_key:string;source_version:string;status:string}>('SELECT c.id,c.card_key,c.source_version,n.source_key,n.title,n.body,n.href,c.read,c.created_at,c.updated_at,c.status,c.email_reason FROM notification_cards c JOIN notifications n ON n.id=c.latest_notification_id AND n.user_id=c.user_id WHERE c.user_id=? ORDER BY c.updated_at DESC LIMIT 100',u.userId);
 return json({notifications:items.filter(n=>current.has(n.card_key)&&(settings.inApp||['corrected','withdrawn','expired','updated'].includes(current.get(n.card_key)!.status))).map(n=>{const latest=current.get(n.card_key)!;return latest.headValid&&latest.version===n.source_version?{...n,title:latest.title,body:latest.body,status:latest.status,email_reason:latest.holds.join(' · ')}:{...n,email_reason:'최신 조건 확인이 필요합니다. 새로 확인을 눌러주세요.'};}),disabled:!settings.inApp,email});
}catch(e){return failure(e);}}
export async function POST(request:Request){try{
 const u=await authenticated(),p=await input(request,z.object({action:z.enum(['refresh','read','hide']),id:z.string().uuid().optional(),expectedSourceKey:z.string().max(500).optional()}));
 if(p.action!=='refresh'){
  if(!p.id)throw new ApiError(400,'알림을 선택해주세요.');
  const notice=await one<{source_key:string}>('SELECT source_key FROM notifications WHERE id=? AND user_id=?',p.id,u.userId);
  if(!notice)throw new ApiError(404,'알림을 찾을 수 없습니다.');
  if(p.action==='read'){
   const card=await one<{id:string;latest_notification_id:string;source_version:string;source_key:string}>('SELECT c.id,c.latest_notification_id,c.source_version,n.source_key FROM notification_cards c JOIN notifications n ON n.id=c.latest_notification_id AND n.user_id=c.user_id WHERE c.user_id=? AND (c.id=? OR c.latest_notification_id=?)',u.userId,p.id,p.id);
   if(!card||(p.expectedSourceKey?card.source_key!==p.expectedSourceKey:card.latest_notification_id!==p.id))throw new ApiError(409,'알림 내용이 변경되었습니다. 새 내용을 확인해주세요.');
   const result=await db().prepare('UPDATE notification_cards SET read=1 WHERE id=? AND user_id=? AND latest_notification_id=? AND source_version=?').bind(card.id,u.userId,card.latest_notification_id,card.source_version).run();
   if(!result.meta.changes)throw new ApiError(409,'알림 내용이 변경되었습니다. 새 내용을 확인해주세요.');
   return json({read:true});
  }
  const topic=notice.source_key.split(':').slice(0,2).join(':'),stamp=now(),revision=id();
  await db().batch([
   db().prepare("INSERT OR IGNORE INTO private_records(id,user_id,kind,target,payload,created_at,updated_at) VALUES(?,?,'settings','preferences',?,?,?)").bind(id(),u.userId,JSON.stringify({name:'',interests:[],includeAlternatives:false,inApp:true,email:false,hiddenTopics:[]}),stamp,stamp),
   db().prepare("UPDATE private_records SET payload=json_set(payload,'$.hiddenTopics',CASE WHEN EXISTS (SELECT 1 FROM json_each(COALESCE(json_extract(payload,'$.hiddenTopics'),'[]')) WHERE value=?) THEN json(COALESCE(json_extract(payload,'$.hiddenTopics'),'[]')) ELSE json_insert(COALESCE(json_extract(payload,'$.hiddenTopics'),'[]'),'$[#]',?) END,'$.emailRevision',?),updated_at=? WHERE user_id=? AND kind='settings' AND target='preferences'").bind(topic,topic,revision,stamp,u.userId),
   ...cancelEmailStatements(u.userId,'Notification topic hidden',"EXISTS (SELECT 1 FROM private_records WHERE user_id=? AND kind='settings' AND target='preferences' AND json_extract(payload,'$.emailRevision')=?)",[u.userId,revision],topic),
  ]);return json({hidden:true});
 }
 const result=await generateNotifications(u.userId),email=await deliverEmailForUser(u.userId);return json({...result,email});
}catch(e){return failure(e);}}
