import {z} from 'zod';
import {authenticated,input,json,failure,ApiError} from '@/lib/http';
import {one,id,now} from '@/lib/db';
import {activeTerms,supersededTerms,today,validDate,type TermsVersion} from '@/lib/billing';
import {checkRevision,commitHistory,historyContext,mirrorWrites,normalizeTerms,versionHistory} from '@/lib/contract-history';
const schema=z.object({subscriptionId:z.string().min(1).max(100),expectedRevision:z.number().int().nonnegative(),historyId:z.string().max(100).optional(),action:z.enum(['initialize','append','correct','void']),effectiveFrom:z.string().refine(validDate).nullable().optional(),supersedes:z.string().max(100).optional(),terms:z.record(z.unknown()).optional(),reason:z.string().trim().min(1).max(500),sourceNote:z.string().max(500).default(''),alreadyChanged:z.boolean().default(false)});
export async function POST(request:Request){try{
 const u=await authenticated(),data=await input(request,schema),parent=await one<{id:string;payload:string}>("SELECT id,payload FROM private_records WHERE id=? AND user_id=? AND kind='subscription'",data.subscriptionId,u.userId);
 if(!parent)throw new ApiError(404,'구독을 찾을 수 없습니다.');
 const c=await historyContext(u.userId,{id:parent.id,payload:JSON.parse(parent.payload)});checkRevision(c,data);
 if(data.action==='initialize'){if(c.exists)throw new ApiError(409,'이미 조건 이력이 있습니다. 새로 불러와주세요.');const history=await commitHistory(c,mirrorWrites(c,c.history));return json({history,historyId:c.historyId});}
 const old=c.history.versions.find(v=>v.id===data.supersedes),replaced=supersededTerms(c.history);
 if(data.action!=='append'&&(!old||replaced.has(old.id)||old.state==='void'))throw new ApiError(409,'정정할 이력을 다시 선택해주세요.');
 if(data.action==='append'&&data.supersedes)throw new ApiError(400,'기존 이력을 바꾸려면 정정을 선택해주세요.');
 if(data.action==='void'&&old?.state==='confirmed'&&old.effectiveFrom!<=today())throw new ApiError(400,'이미 적용된 조건은 삭제 대신 적용일과 조건을 정정해주세요.');
 if(data.action!=='void'&&!data.terms)throw new ApiError(400,'변경 조건을 입력해주세요.');
 const terms=data.action==='void'?old!.terms:normalizeTerms(data.terms!),effectiveFrom=data.effectiveFrom||null;
 if(data.action!=='void'&&effectiveFrom&&data.action==='append'&&effectiveFrom<c.history.knownFrom)throw new ApiError(400,'최초 적용일을 변경하려면 첫 이력을 정정해주세요.');
 const previous=activeTerms(c.history).filter(v=>v.effectiveFrom!<=(effectiveFrom||today())).at(-1);
 if(data.action!=='void'&&previous&&terms.remainingPayments===previous.terms.remainingPayments&&terms.cycle===previous.terms.cycle&&terms.anchorDate===previous.terms.anchorDate&&!data.terms?.remainingFromDate)terms.remainingFromDate=previous.terms.remainingFromDate;
 if(terms.remainingPayments!=null&&terms.remainingPayments>0&&!terms.remainingFromDate)throw new ApiError(400,'잔여 횟수를 세기 시작할 청구일을 입력해주세요.');
 const version:TermsVersion={id:id(),recordedAt:now(),effectiveFrom:data.action==='void'?null:effectiveFrom,state:data.action==='void'?'void':effectiveFrom?'confirmed':'draft',terms,reason:data.reason,sourceNote:data.sourceNote,basis:'effective',...data.action!=='append'?{supersedes:old!.id}:{},...!effectiveFrom&&data.alreadyChanged?{uncertainFrom:today()}:{}};
 const next=versionHistory(c.history,version),history=await commitHistory(c,mirrorWrites(c,next),next);
 return json({history,historyId:c.historyId});
}catch(e){return failure(e);}}
