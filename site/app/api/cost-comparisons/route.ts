import {z} from 'zod';
import {authenticated,input,json,failure,ApiError} from '@/lib/http';
import {db,one,rows,id,now} from '@/lib/db';
import {checkRevision,historyContext} from '@/lib/contract-history';
import {comparisonSchema,datedComparison} from '@/lib/dated-comparison';
import {today,type Contract,type Payment} from '@/lib/billing';
const text=(max:number)=>z.string().trim().max(max),identifier=text(100).min(1);
const annotations={decision:z.enum(['consider','stay','change','defer','notInterested']),reason:text(1000),outcome:text(2000)};
const schema=z.discriminatedUnion('action',[
 z.object({action:z.literal('save'),subscriptionId:identifier,expectedRevision:z.number().int().nonnegative(),historyId:identifier,title:text(200).min(1),conditions:comparisonSchema,...annotations}),
 z.object({action:z.literal('annotate'),id:identifier,...annotations}),z.object({action:z.literal('delete'),id:identifier}),
]);
export async function POST(request:Request){try{
 const u=await authenticated(),data=await input(request,schema),stamp=now();
 if(data.action!=='save'){
  const owned=await one<{id:string;payload:string;created_at:string}>("SELECT id,payload,created_at FROM private_records WHERE id=? AND user_id=? AND kind='costComparison'",data.id,u.userId);if(!owned)throw new ApiError(404,'비교 기록을 찾을 수 없습니다.');
  if(data.action==='delete'){const r=await db().prepare("DELETE FROM private_records WHERE id=? AND user_id=? AND kind='costComparison'").bind(data.id,u.userId).run();if(!r.meta.changes)throw new ApiError(404,'비교 기록을 찾을 수 없습니다.');return json({deleted:true});}
  const payload={...JSON.parse(owned.payload),decision:data.decision,reason:data.reason,outcome:data.outcome};
  const r=await db().prepare("UPDATE private_records SET payload=?,updated_at=? WHERE id=? AND user_id=? AND kind='costComparison'").bind(JSON.stringify(payload),stamp,data.id,u.userId).run();if(!r.meta.changes)throw new ApiError(404,'비교 기록을 찾을 수 없습니다.');
  return json({record:{id:data.id,kind:'costComparison',target:null,payload,created_at:owned.created_at,updated_at:stamp}});
 }
 const parent=await one<{id:string;payload:string}>("SELECT id,payload FROM private_records WHERE id=? AND user_id=? AND kind='subscription'",data.subscriptionId,u.userId);if(!parent)throw new ApiError(404,'구독을 찾을 수 없습니다.');
 const c=await historyContext(u.userId,{id:parent.id,payload:JSON.parse(parent.payload)});if(!c.exists)throw new ApiError(409,'구독의 조건 이력을 먼저 확인·저장해주세요.');checkRevision(c,data);
 const contracts=c.members.map(m=>({...m.payload,id:m.id,termsHistory:c.history} as Contract));
 const raw=await rows<{id:string;payload:string}>("SELECT id,payload FROM private_records WHERE user_id=? AND kind='payment'",u.userId),payments=raw.map(r=>({...JSON.parse(r.payload),id:r.id} as Payment)).filter(p=>c.members.some(m=>m.id===p.subscriptionId));
 let result;try{result=datedComparison(contracts,payments,data.conditions,today());}catch(e){throw new ApiError(400,(e as Error).message);}
 const payload={schemaVersion:1,title:data.title,subscriptionId:data.subscriptionId,subscriptionName:JSON.parse(parent.payload).name,conditions:data.conditions,result,source:{identity:c.target,historyId:c.historyId,revision:c.history.revision,contracts,payments},decision:data.decision,reason:data.reason,outcome:data.outcome,calculatedAt:stamp};
 const recordId=id();
 // Capture exactly this financial revision without changing the actual contract or ledger.
 const r=await db().prepare("INSERT INTO private_records(id,user_id,kind,target,payload,created_at,updated_at) SELECT ?,?,'costComparison',NULL,?,?,? WHERE EXISTS (SELECT 1 FROM private_records h WHERE h.id=? AND h.user_id=? AND h.kind='billing_terms' AND h.target=? AND json_extract(h.payload,'$.revision')=?) AND EXISTS (SELECT 1 FROM private_records WHERE id=? AND user_id=? AND kind='subscription')").bind(recordId,u.userId,JSON.stringify(payload),stamp,stamp,c.historyId,u.userId,c.target,c.history.revision,parent.id,u.userId).run();
 if(r.meta.changes!==1)throw new ApiError(409,'계약 또는 결제 기록이 변경되었습니다. 새로 불러온 뒤 다시 비교해주세요.');
 return json({record:{id:recordId,kind:'costComparison',target:null,payload,created_at:stamp,updated_at:stamp}});
}catch(e){return failure(e);}}
