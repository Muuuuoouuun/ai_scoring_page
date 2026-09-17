import {env} from 'cloudflare:workers';
import {db,one,id,now} from './db';
import {ApiError} from './http';
import {settingsSchema} from './validation';
import {cancelEmailStatements} from './email-cancellation';
import rawPromotions from '@/data/promotions.json';
import {eligibilityFingerprint,type Promotion} from './promotion-facts';
import {emailSchedule} from './email-timing';

const promotions=rawPromotions as Promotion[];

type Mutation={action:'save'|'delete';id?:string;ifAbsent?:boolean;payload?:unknown;expectedSettingsRevision?:string};
type Stored={id:string;payload:string;updated_at:string};
const conflict=()=>new ApiError(409,'설정이 다른 곳에서 변경되었습니다. 새로 불러온 뒤 다시 저장해주세요.');

export async function mutateSettings(user:{userId:string;email:string},data:Mutation){
 const current=await one<Stored>("SELECT id,payload,updated_at FROM private_records WHERE user_id=? AND kind='settings' AND target='preferences'",user.userId);
 if(data.id&&data.id!==current?.id)throw new ApiError(404,'설정을 찾을 수 없습니다.');
 const previous=current?JSON.parse(current.payload):{};
 if(data.action==='save'&&current&&data.ifAbsent)return {record:{id:current.id,kind:'settings',target:'preferences',payload:previous,updated_at:current.updated_at},alreadyExists:true};
 const revision=previous.emailRevision||'';
 if((data.expectedSettingsRevision??'')!==revision)throw conflict();
 if(data.action==='delete'){
  if(!current||!data.id)throw new ApiError(404,'설정을 찾을 수 없습니다.');
  const result=await db().batch([
   ...cancelEmailStatements(user.userId,'Email preferences removed',"EXISTS (SELECT 1 FROM private_records WHERE id=? AND user_id=? AND COALESCE(json_extract(payload,'$.emailRevision'),'')=?)",[current.id,user.userId,revision]),
   db().prepare("DELETE FROM private_records WHERE id=? AND user_id=? AND kind='settings' AND COALESCE(json_extract(payload,'$.emailRevision'),'')=?").bind(current.id,user.userId,revision),
  ]);
  if(!result.at(-1)!.meta.changes)throw conflict();
  return {deleted:true};
 }
 const checked=settingsSchema.safeParse(data.payload);
 if(!checked.success)throw new ApiError(400,checked.error.issues[0]?.message||'설정을 확인해주세요.');
 const value=checked.data;
 for(const p of promotions){
  const token=value.promotionEligibilityVersions[p.id];
  if(value.promotionEligibility[p.id]==='eligible'&&token&&token!==eligibilityFingerprint(p))throw new ApiError(409,'혜택 자격 조건이 변경되었습니다. 현재 공식 조건을 다시 확인해주세요.');
 }
 const confirmedAt=Object.fromEntries(promotions.filter(p=>value.promotionEligibility[p.id]==='eligible'&&value.promotionEligibilityVersions[p.id]===eligibilityFingerprint(p)).map(p=>[p.id,previous.promotionEligibility?.[p.id]==='eligible'&&previous.promotionEligibilityVersions?.[p.id]===value.promotionEligibilityVersions[p.id]?previous.promotionEligibilityConfirmedAt?.[p.id]||now():now()]));
 const config=env as unknown as Record<string,string>;
 if(value.email&&(!config.RESEND_API_KEY||!config.EMAIL_FROM||!config.SITE_URL))throw new ApiError(503,'이메일 발송 연결이 아직 준비되지 않았습니다.');
 const explicitlyTimed=value.emailMode!==undefined&&value.emailTimeZone!==undefined&&value.emailTime!==undefined;
 const newRevision=id(),stamp=now(),recordId=current?.id||id();
 const payload={...value,promotionEligibilityConfirmedAt:confirmedAt,
  emailMode:value.emailMode??previous.emailMode??'digest',
  emailTimeZone:emailSchedule({emailTimeZone:value.emailTimeZone??previous.emailTimeZone??'Asia/Seoul'}).timeZone,
  emailTime:value.emailTime??previous.emailTime??'09:00',
  emailTimingConfirmed:explicitlyTimed||previous.emailTimingConfirmed===true,
  emailAddress:value.email?user.email:'',
  emailRevision:newRevision,
  hiddenTopics:(previous.hiddenTopics||[]).filter((topic:string)=>!value.restoreTopics?.includes(topic)),
 };
 delete payload.restoreTopics;
 const writes=[current?
  db().prepare("UPDATE private_records SET payload=?,updated_at=? WHERE id=? AND user_id=? AND kind='settings' AND COALESCE(json_extract(payload,'$.emailRevision'),'')=?").bind(JSON.stringify(payload),stamp,recordId,user.userId,revision):
  db().prepare("INSERT OR IGNORE INTO private_records(id,user_id,kind,target,payload,created_at,updated_at) VALUES(?,?,'settings','preferences',?,?,?)").bind(recordId,user.userId,JSON.stringify(payload),stamp,stamp),
 ];
 if(!payload.email)writes.push(...cancelEmailStatements(user.userId,'Email consent withdrawn',"EXISTS (SELECT 1 FROM private_records WHERE id=? AND user_id=? AND json_extract(payload,'$.emailRevision')=?)",[recordId,user.userId,newRevision]));
 const result=await db().batch(writes);
 if(!result[0].meta.changes)throw conflict();
 return {record:{id:recordId,kind:'settings',target:'preferences',payload,updated_at:stamp}};
}
