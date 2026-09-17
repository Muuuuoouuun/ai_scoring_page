import {mutateSettings} from '@/lib/workspace-settings';
import { z } from 'zod';
import {hydrateHistories} from '@/lib/contract-history';
import {mutateBilling} from '@/lib/workspace-billing';
import { authenticated,input,json,failure,ApiError } from '@/lib/http';
import { rows,one,db,id,now } from '@/lib/db';
import { recordInput,recordSchemas } from '@/lib/validation';
import {findTool} from '@/lib/catalog';
export const dynamic='force-dynamic';
export async function GET(){try{const u=await authenticated();const records=await rows<{id:string;kind:string;target:string|null;payload:string;created_at:string;updated_at:string}>("SELECT id,kind,target,payload,created_at,updated_at FROM private_records WHERE user_id=? AND kind!='billing_terms' ORDER BY updated_at DESC LIMIT 2000",u.userId);return json({records:await hydrateHistories(u.userId,records.map(r=>({...r,payload:JSON.parse(r.payload)})))});}catch(e){return failure(e);}}
export async function POST(request:Request){try{
  const u=await authenticated(),data=await input(request,recordInput),stamp=now();
  if(data.kind==='settings')return json(await mutateSettings(u,data));
  if(['subscription','payment','cancellation'].includes(data.kind))return json(await mutateBilling(u.userId,data));
  if(data.action==='delete'){
    if(!data.id)throw new ApiError(400,'삭제할 기록이 없습니다.');
    if(data.kind==='collection'){
      const linked=await one<{count:number}>("SELECT COUNT(*) count FROM private_records WHERE user_id=? AND kind='library' AND json_extract(payload,'$.collection')=?",u.userId,data.id);
      if((linked?.count??0)>0)throw new ApiError(409,'도구의 모음을 먼저 변경하거나 해제해주세요.');
    }
    const result=await db().prepare('DELETE FROM private_records WHERE id=? AND user_id=? AND kind=?').bind(data.id,u.userId,data.kind).run();
    if(!result.meta.changes)throw new ApiError(404,'기록을 찾을 수 없습니다.');
    return json({deleted:true});
  }
  const validated=recordSchemas[data.kind].safeParse(data.payload);
  if(!validated.success)throw new ApiError(400,validated.error.issues[0]?.message||'입력을 확인해주세요.');
  const payload=validated.data;
  if(data.kind==='library'&&'collection' in payload&&payload.collection){
    if(!await one("SELECT id FROM private_records WHERE id=? AND user_id=? AND kind='collection'",payload.collection,u.userId))throw new ApiError(400,'모음을 확인해주세요.');
  }
  let target=data.target??null;
  if(data.kind==='library'&&'toolId' in payload){
    const selected=payload.toolId??data.target??'';
    if(selected&&!findTool(selected))throw new ApiError(400,'등록된 서비스를 선택하거나 직접 입력으로 바꿔주세요.');
    payload.toolId=selected;
    target=selected||null;
  }else if(data.kind==='library'){
    if(target&&!findTool(target))throw new ApiError(400,'등록된 서비스를 확인해주세요.');
    Object.assign(payload,{toolId:target||''});
  }
  let recordId=data.id;
  if(recordId){const owned=await one('SELECT id FROM private_records WHERE id=? AND user_id=? AND kind=?',recordId,u.userId,data.kind);if(!owned)throw new ApiError(404,'기록을 찾을 수 없습니다.');}
  if(data.kind==='library'&&target){
    const existing=await one<{id:string}>('SELECT id FROM private_records WHERE user_id=? AND kind=? AND target=?',u.userId,data.kind,target);
    if(existing&&existing.id!==recordId&&(recordId||!data.ifAbsent))throw new ApiError(409,'이미 내 도구함에 연결된 서비스입니다. 기존 기록에서 수정해주세요.');
  }
  if(!recordId&&target&&(data.kind!=='library'||data.ifAbsent)){const existing=await one<{id:string}>('SELECT id FROM private_records WHERE user_id=? AND kind=? AND target=?',u.userId,data.kind,target);recordId=existing?.id;}
  if(recordId&&data.ifAbsent){const existing=await one<{id:string;kind:string;target:string|null;payload:string;updated_at:string}>('SELECT id,kind,target,payload,updated_at FROM private_records WHERE id=? AND user_id=?',recordId,u.userId);return json({record:{...existing,payload:JSON.parse(existing!.payload)},alreadyExists:true});}
  const statements=[];
  if(recordId)statements.push(data.kind==='library'?db().prepare('UPDATE private_records SET payload=?,target=?,updated_at=? WHERE id=? AND user_id=? AND kind=?').bind(JSON.stringify(payload),target,stamp,recordId,u.userId,data.kind):db().prepare('UPDATE private_records SET payload=?,updated_at=? WHERE id=? AND user_id=? AND kind=?').bind(JSON.stringify(payload),stamp,recordId,u.userId,data.kind));
  else{recordId=id();statements.push(db().prepare('INSERT INTO private_records(id,user_id,kind,target,payload,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').bind(recordId,u.userId,data.kind,target,JSON.stringify(payload),stamp,stamp));}
  try{await db().batch(statements);}catch(e){if((e as Error).message.includes('UNIQUE')&&data.kind==='library')throw new ApiError(409,'이미 내 도구함에 연결된 서비스입니다. 새로 불러온 뒤 확인해주세요.');if((e as Error).message.includes('UNIQUE')&&data.kind==='payment')throw new ApiError(409,'같은 청구에 연결된 결제가 이미 있습니다. 새로 불러온 뒤 확인해주세요.');throw e;}
  return json({record:{id:recordId,kind:data.kind,target,payload,updated_at:stamp}});
}catch(e){return failure(e);}}
export async function DELETE(request:Request){try{const u=await authenticated();await input(request,z.object({confirmation:z.literal('내 기록 삭제')}));const d=db();await d.batch([
  d.prepare('DELETE FROM reactions WHERE post_id IN (SELECT id FROM posts WHERE user_id=?) OR user_id=?').bind(u.userId,u.userId),
  d.prepare('DELETE FROM reports WHERE user_id=?').bind(u.userId),
  d.prepare("UPDATE posts SET user_id='deleted',author='탈퇴한 작성자',title='삭제된 글',body='',task='',plan='',used_at=NULL,affiliation='none',ratings=NULL,status='deleted' WHERE user_id=?").bind(u.userId),
  d.prepare('DELETE FROM private_records WHERE user_id=?').bind(u.userId),
  d.prepare('DELETE FROM email_outbox WHERE user_id=?').bind(u.userId),
  d.prepare('DELETE FROM email_deliveries WHERE user_id=?').bind(u.userId),
  d.prepare('DELETE FROM email_dispatch_state WHERE user_id=?').bind(u.userId),
  d.prepare('DELETE FROM notification_cards WHERE user_id=?').bind(u.userId),
  d.prepare('DELETE FROM notifications WHERE user_id=?').bind(u.userId),
  d.prepare('DELETE FROM feedback_sessions WHERE user_id=?').bind(u.userId),
]);return json({deleted:true});}catch(e){return failure(e);}}
