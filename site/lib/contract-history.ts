import {z} from 'zod';
import {activeTerms,billingIdentity,contractTermsAt,paymentDates,today,validDate,type Contract,type Terms,type TermsHistory,type TermsVersion} from './billing';
import {subscriptionSchema} from './validation';
import {db,id,now,one,rows} from './db';
import {ApiError} from './http';

// The entire snapshot is explicit: a missing old property cannot leak in from today's contract.
export const termKeys=['plan','amount','currency','cycle','cycleMonths','anchorDate','nextDate','status','remainingPayments','remainingFromDate','endDate','amountBasis','seats','taxStatus','taxAmount','pricingMode','usageBudget','personalShare','pauseBilling','resumeDate'] as const;
export function normalizeTerms(value:Record<string,unknown>):Terms{
 const validated=subscriptionSchema.safeParse({name:'Contract',paymentRoute:'unknown',...value});if(!validated.success)throw new ApiError(400,validated.error.issues[0]?.message||'계약 조건을 확인해주세요.');const parsed=validated.data;
 const result=Object.fromEntries(termKeys.map(k=>[k,(parsed as Record<string,unknown>)[k]??null])) as unknown as Terms;
 result.anchorDate=result.anchorDate||result.nextDate||null;
 result.remainingFromDate=result.remainingFromDate||result.nextDate||null;
 if(result.cycle==='custom'&&!result.cycleMonths)throw new ApiError(400,'결제 간격을 입력해주세요.');
 if(result.anchorDate&&result.nextDate&&(result.anchorDate>result.nextDate||result.cycle!=='manual'&&!paymentDates(result.anchorDate,result.cycle,result.nextDate,result.cycleMonths,result.anchorDate).includes(result.nextDate)))throw new ApiError(400,'다음 결제일이 주기 기준과 맞지 않습니다. 기준일과 주기를 함께 확인해주세요.');
 return result;
}
export function sameTerms(a:Record<string,unknown>,b:Record<string,unknown>){return JSON.stringify(normalizeTerms(a))===JSON.stringify(normalizeTerms(b));}
export function seedHistory(payload:Record<string,unknown>,knownFrom=today(),basis:'observed'|'effective'='observed'):TermsHistory{
 const terms=normalizeTerms(payload),stamp=now();
 const change=typeof payload.priceChangesAt==='string'&&validDate(payload.priceChangesAt)?payload.priceChangesAt:null;
 if(change&&change<=knownFrom)terms.amount=typeof payload.renewalAmount==='number'?payload.renewalAmount:null;
 const baseline:TermsVersion={id:id(),recordedAt:stamp,effectiveFrom:knownFrom,state:'confirmed',terms,basis,reason:basis==='observed'?'기록일 기준 현재 조건 · 이전 적용일 미확인':'확인한 최초 조건'};
 const history:TermsHistory={schemaVersion:1,revision:0,knownFrom,versions:[baseline],legacySnapshot:payload};
 if(change&&change>knownFrom)history.versions.push({id:id(),recordedAt:stamp,effectiveFrom:change,state:'confirmed',basis:'effective',terms:{...terms,amount:typeof payload.renewalAmount==='number'?payload.renewalAmount:null},reason:'기록된 새 요금 적용일'});
 return history;
}
const storedHistory=z.object({schemaVersion:z.literal(1),revision:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER-1),knownFrom:z.string().refine(validDate),versions:z.array(z.object({id:z.string().min(1),recordedAt:z.string(),effectiveFrom:z.string().refine(validDate).nullable(),state:z.enum(['confirmed','draft','void']),terms:z.record(z.unknown()),reason:z.string(),supersedes:z.string().optional(),uncertainFrom:z.string().refine(validDate).nullable().optional(),basis:z.enum(['observed','effective']).optional(),sourceNote:z.string().optional()})).max(1000),legacySnapshot:z.record(z.unknown()).optional()});
export function parseHistory(raw:string):TermsHistory{
 try{const h=storedHistory.parse(JSON.parse(raw));return {...h,versions:h.versions.map(v=>({...v,terms:normalizeTerms(v.terms)}))};}catch{throw new ApiError(409,'조건 이력을 확인하지 못했습니다. 기존 기록을 내보낸 뒤 문의해주세요.');}
}
export type Member={id:string;payload:Record<string,any>};
export type HistoryContext={userId:string;target:string;historyId:string;history:TermsHistory;exists:boolean;members:Member[];bootstrapParentId:string|null};
export async function historyContext(userId:string,contract:Member,isNewContract=false):Promise<HistoryContext>{
 const target=billingIdentity({id:contract.id,bundleId:contract.payload.bundleId}),h=await one<{id:string;payload:string}>("SELECT id,payload FROM private_records WHERE user_id=? AND kind='billing_terms' AND target=?",userId,target);
 const raw=contract.payload.bundleId?await rows<{id:string;payload:string}>("SELECT id,payload FROM private_records WHERE user_id=? AND kind='subscription' AND json_extract(payload,'$.bundleId')=?",userId,contract.payload.bundleId):await rows<{id:string;payload:string}>("SELECT id,payload FROM private_records WHERE user_id=? AND kind='subscription' AND id=?",userId,contract.id);
 const members=raw.map(r=>({id:r.id,payload:JSON.parse(r.payload)}));
 if(!h&&members.some(m=>!sameTerms(m.payload,members[0].payload)||['priceChangesAt','renewalAmount'].some(k=>(m.payload[k]??null)!==(members[0].payload[k]??null))))throw new ApiError(409,'번들에 서로 다른 조건이 있습니다. 기존 기록을 확인해주세요.');
 return {userId,target,historyId:h?.id||id(),history:h?parseHistory(h.payload):seedHistory(members[0]?.payload||contract.payload),exists:!!h,members,bootstrapParentId:isNewContract?(members[0]?.id||null):contract.id};
}
export type RevisionInput={expectedRevision?:number;historyId?:string};
export function checkRevision(c:HistoryContext,input:RevisionInput){
 if(input.expectedRevision!==c.history.revision||c.exists&&input.historyId!==c.historyId)throw new ApiError(409,'다른 창에서 기록이 변경되었습니다. 목록을 새로 불러온 뒤 다시 저장해주세요.');
}
export type RecordWrite={action:'save'|'delete';id:string;kind:string;target?:string|null;payload?:Record<string,unknown>;isNew?:boolean};
export async function commitHistory(c:HistoryContext,writes:RecordWrite[],next=c.history,removeAuthority=false){
 const d=db(),stamp=now(),revision=c.history.revision;
 const guard="EXISTS (SELECT 1 FROM private_records h WHERE h.id=? AND h.user_id=? AND h.kind='billing_terms' AND h.target=? AND json_extract(h.payload,'$.revision')=?)";
 const params=[c.historyId,c.userId,c.target,revision],statements=[];
 if(!c.exists){
  const parentCheck=c.bootstrapParentId?" WHERE EXISTS (SELECT 1 FROM private_records WHERE id=? AND user_id=? AND kind='subscription')":'';
  statements.push(d.prepare("INSERT INTO private_records(id,user_id,kind,target,payload,created_at,updated_at) SELECT ?,?,'billing_terms',?,?,?,?"+parentCheck+" ON CONFLICT(user_id,kind,target) DO NOTHING").bind(c.historyId,c.userId,c.target,JSON.stringify(c.history),stamp,stamp,...c.bootstrapParentId?[c.bootstrapParentId,c.userId]:[]));
 }

 for(const w of writes){
  if(w.action==='delete')statements.push(d.prepare('DELETE FROM private_records WHERE id=? AND user_id=? AND kind=? AND '+guard).bind(w.id,c.userId,w.kind,...params));
  else if(w.isNew)statements.push(d.prepare('INSERT INTO private_records(id,user_id,kind,target,payload,created_at,updated_at) SELECT ?,?,?,?,?,?,? WHERE '+guard).bind(w.id,c.userId,w.kind,w.target??null,JSON.stringify(w.payload),stamp,stamp,...params));
  else statements.push(d.prepare('UPDATE private_records SET payload=?,updated_at=? WHERE id=? AND user_id=? AND kind=? AND '+guard).bind(JSON.stringify(w.payload),stamp,w.id,c.userId,w.kind,...params));
 }
 const history={...next,revision:revision+1};
 // Every business write above shares this guard. A zero-row last UPDATE alone cannot roll back earlier writes.
 if(removeAuthority)statements.push(d.prepare("DELETE FROM private_records WHERE id=? AND user_id=? AND kind='billing_terms' AND target=? AND json_extract(payload,'$.revision')=?").bind(...params));
 else statements.push(d.prepare("UPDATE private_records SET payload=?,updated_at=? WHERE id=? AND user_id=? AND kind='billing_terms' AND target=? AND json_extract(payload,'$.revision')=?").bind(JSON.stringify(history),stamp,...params));
 const results=await d.batch(statements);
 if(results.at(-1)?.meta.changes!==1)throw new ApiError(409,'다른 창에서 기록이 변경되었습니다. 새로 불러온 뒤 확인해주세요.');
 return history;
}
export function currentPayload(c:HistoryContext,payload:Record<string,any>,history=c.history){
 const terms=contractTermsAt({id:'view',...payload,termsHistory:history} as Contract,today());
 return {...payload,...terms?Object.fromEntries(termKeys.map(k=>[k,terms[k]??null])):{},priceChangesAt:null,renewalAmount:null,termsHistory:history,historyId:c.historyId};
}
export async function hydrateHistories<T extends {id:string;kind:string;payload:Record<string,any>}>(userId:string,records:T[]):Promise<T[]>{
 const histories=await rows<{id:string;target:string;payload:string}>("SELECT id,target,payload FROM private_records WHERE user_id=? AND kind='billing_terms'",userId),map=new Map(histories.map(r=>[r.target,{id:r.id,history:parseHistory(r.payload)}]));
 return records.map(r=>{if(r.kind!=='subscription')return r;const h=map.get(billingIdentity({id:r.id,bundleId:r.payload.bundleId}));return h?{...r,payload:currentPayload({history:h.history,historyId:h.id} as HistoryContext,r.payload)}:r;});
}
export function versionHistory(history:TermsHistory,version:TermsVersion){
 const next={...history,versions:[...history.versions,version]};
 const active=activeTerms(next);
 if(active.some((v,i)=>i>0&&v.effectiveFrom===active[i-1].effectiveFrom))throw new ApiError(400,'같은 적용일의 조건이 있습니다. 해당 이력을 정정해주세요.');
 if(next.versions.length>1000)throw new ApiError(400,'이력이 많아 추가할 수 없습니다. 기록을 내보낸 뒤 새 계약으로 이어서 기록해주세요.');
 if(active[0]?.effectiveFrom)next.knownFrom=active[0].effectiveFrom;
 return next;
}
export function mirrorWrites(c:HistoryContext,history:TermsHistory):RecordWrite[]{
 return c.members.map(m=>{const payload=currentPayload(c,m.payload,history);delete (payload as Record<string,unknown>).termsHistory;delete (payload as Record<string,unknown>).historyId;return {action:'save',kind:'subscription',id:m.id,payload};});
}
