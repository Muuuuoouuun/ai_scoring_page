import {z} from 'zod';
import {recordInput,recordSchemas} from './validation';
import {ApiError} from './http';
import {id,now,one,rows} from './db';
import {activeTerms,contractTermsAt,occurrenceKey,paymentDates,monthAfter,summarizeContracts,today,type Contract,type Payment,type TermsVersion} from './billing';
import {checkRevision,commitHistory,currentPayload,historyContext,mirrorWrites,normalizeTerms,sameTerms,versionHistory,type Member,type RecordWrite} from './contract-history';
type Input=z.infer<typeof recordInput>;
type Row={id:string;payload:string;target:string|null};
async function owned(userId:string,recordId:string,kind:string){return one<Row>('SELECT id,payload,target FROM private_records WHERE id=? AND user_id=? AND kind=?',recordId,userId,kind);}
export async function mutateBilling(userId:string,data:Input){
 const kind=data.kind,stamp=now();
 let old=data.id?await owned(userId,data.id,kind):null;
 if(data.id&&!old)throw new ApiError(404,'기록을 찾을 수 없습니다.');
 if(!old&&data.target)old=await one<Row>('SELECT id,payload,target FROM private_records WHERE user_id=? AND kind=? AND target=?',userId,kind,data.target);
 if(old&&data.ifAbsent)return {record:{...old,kind,payload:JSON.parse(old.payload)},alreadyExists:true};
 if(data.action==='delete'&&!old)throw new ApiError(404,'기록을 찾을 수 없습니다.');
 const previous=old?JSON.parse(old.payload):null,recordId=old?.id||id();
 const validated=data.action==='save'?recordSchemas[kind].safeParse(data.payload):null;
 if(validated&&!validated.success)throw new ApiError(400,validated.error.issues[0]?.message||'입력을 확인해주세요.');
 const payload:Record<string,any>=validated?.success?validated.data:previous;
 if(kind==='subscription'&&!payload.anchorDate)payload.anchorDate=previous?.anchorDate||previous?.nextDate||payload.nextDate||'';
 if(kind!=='subscription'&&previous&&previous.subscriptionId!==payload.subscriptionId)throw new ApiError(400,'연결 구독은 변경할 수 없습니다. 기존 기록을 확인한 뒤 별도로 기록해주세요.');
 const parent=kind==='subscription'?{id:recordId,payload}:await owned(userId,payload.subscriptionId,'subscription');
 if(!parent)throw new ApiError(400,'연결할 구독을 확인해주세요.');
 const contract:Member={id:parent.id,payload:typeof parent.payload==='string'?JSON.parse(parent.payload):parent.payload};
 if(kind==='subscription'&&previous&&(previous.bundleId||'')!==(payload.bundleId||''))throw new ApiError(409,'기록 이력을 유지하기 위해 번들 식별자는 변경할 수 없습니다. 별도 계약으로 기록해주세요.');
 const c=await historyContext(userId,kind==='subscription'&&previous?{id:recordId,payload:previous}:contract,kind==='subscription'&&!old);
 checkRevision(c,{...data,expectedRevision:data.expectedRevision??(!c.exists?0:undefined)});
 if(data.action==='delete'){
  const query=kind==='subscription'?"SELECT COUNT(*) count FROM private_records WHERE user_id=? AND kind IN ('payment','cancellation') AND json_extract(payload,'$.subscriptionId')=?":kind==='payment'?"SELECT COUNT(*) count FROM private_records WHERE user_id=? AND kind='payment' AND json_extract(payload,'$.refundOfId')=?":null;
  if(query&&(await one<{count:number}>(query,userId,recordId))?.count)throw new ApiError(409,kind==='subscription'?'결제·해지 기록이 연결되어 있습니다. 구독 상태를 종료로 바꿔 보관해주세요.':'환불 기록이 연결되어 있습니다. 환불을 먼저 수정하거나 삭제해주세요.');
  await commitHistory(c,[{action:'delete',id:recordId,kind}],c.history,kind==='subscription'&&c.members.length===1);return {deleted:true};
 }
 let next=c.history;
 const writes:RecordWrite[]=[];
 if(kind==='subscription'){
  normalizeTerms(payload);
  const baseline=currentPayload(c,c.members[0]?.payload||contract.payload);
  if(old&&c.exists&&!sameTerms(payload,baseline))throw new ApiError(409,'요금·주기·계약 상태는 조건 이력에서 적용일과 함께 변경해주세요.');
  if(!old&&c.members.length&&payload.priceChangesAt&&!activeTerms(c.history).some(v=>v.effectiveFrom===payload.priceChangesAt&&v.terms.amount===(payload.renewalAmount??null)))throw new ApiError(400,'이 번들에 기록된 미래 요금 조건과 다릅니다. 조건 이력에서 확인해주세요.');
  if(!old&&c.members.length&&!sameTerms(payload,baseline))throw new ApiError(400,'같은 번들의 결제 조건이 다릅니다. 별도 결제라면 다른 식별자를 입력해주세요.');
  // First legacy metadata save also preserves the old financial baseline.
  if(old&&!c.exists&&!sameTerms(payload,previous))throw new ApiError(409,'기존 조건의 적용일을 이력에서 확인한 뒤 변경해주세요.');
 }
 if(kind==='payment')await validatePayment(userId,payload,previous,recordId,{...contract.payload,id:contract.id,termsHistory:c.history} as Contract);
 if(kind==='cancellation'&&previous?.stage!=='prepare'&&previous&&(previous.confirmedAt||'')!==(payload.confirmedAt||''))throw new ApiError(409,'이미 반영한 확인일은 조건 이력에서 해당 이력을 정정해주세요.');
 if(kind==='cancellation'&&payload.stage!=='prepare'){
  if(payload.confirmedAt&&payload.confirmedAt>today())throw new ApiError(400,'해지 확인일은 미래일 수 없습니다.');
  const changed=!previous||['stage','endDate','remainingPayments','confirmedAt'].some(k=>(previous[k]??null)!==(payload[k]??null));
  if(changed){
   const effectiveFrom=payload.confirmedAt||today(),oldTerms=contractTermsAt({...contract.payload,id:contract.id,termsHistory:c.history} as Contract,effectiveFrom);
   if(activeTerms(c.history).some(v=>v.effectiveFrom!>effectiveFrom&&v.effectiveFrom!<=today()))throw new ApiError(409,'해지 확인일 이후 이미 적용된 조건이 있습니다. 조건 이력에서 날짜와 상태를 함께 정정해주세요.');
   if(!oldTerms)throw new ApiError(400,'해지 확인일의 계약 조건이 없습니다. 최초 조건의 적용일을 먼저 확인해주세요.');
   const terms=normalizeTerms({...oldTerms,status:payload.stage==='requested'?'cancel_requested':payload.stage==='confirmed'?'cancelled':'ended',endDate:payload.endDate||null,...payload.remainingPayments!==undefined?{remainingPayments:payload.remainingPayments}:{} });
   if(terms.remainingPayments!==oldTerms.remainingPayments)terms.remainingFromDate=terms.nextDate?paymentDates(terms.nextDate,terms.cycle,monthAfter(effectiveFrom,120),terms.cycleMonths,terms.anchorDate).find(d=>d>=effectiveFrom)||null:null;
   const sameDay=activeTerms(c.history).find(v=>v.effectiveFrom===effectiveFrom);
   const version:TermsVersion={id:id(),recordedAt:stamp,effectiveFrom,state:'confirmed',terms,basis:payload.confirmedAt?'effective':'observed',reason:payload.confirmedAt?'해지 진행 기록의 확인 조건':'기록일 기준 해지 진행 상태',...sameDay?{supersedes:sameDay.id}:{}};
   next=versionHistory(c.history,version);
   // A booked future price snapshot must not undo a cancellation recorded later.
   for(const future of activeTerms(c.history).filter(v=>v.effectiveFrom!>effectiveFrom)){
    const patched={...future.terms,status:terms.status,endDate:terms.endDate,remainingPayments:terms.remainingPayments,remainingFromDate:terms.remainingFromDate};
    next=versionHistory(next,{id:id(),recordedAt:stamp,effectiveFrom:future.effectiveFrom,state:'confirmed',basis:future.basis,terms:patched,supersedes:future.id,reason:'해지 진행 조건을 예정 조건에도 반영'});
   }
   writes.push(...mirrorWrites(c,next));
  }
 }
 writes.unshift({action:'save',kind,id:recordId,target:old?.target??data.target??null,payload,isNew:!old});
 let history;
 try{history=await commitHistory(c,writes,next);}catch(e){if((e as Error).message.includes('UNIQUE')&&kind==='payment')throw new ApiError(409,'같은 청구에 연결된 결제가 이미 있습니다. 새로 불러온 뒤 확인해주세요.');throw e;}
 return {record:{id:recordId,kind,target:old?.target??data.target??null,payload:kind==='subscription'?currentPayload(c,payload,history):payload,updated_at:stamp},historyRevision:history.revision};
}

async function validatePayment(userId:string,p:Record<string,any>,old:Record<string,any>|null,recordId:string,c:Contract){
 if(p.personalAmount!=null&&!p.personalCurrency)throw new ApiError(400,'실제 내 부담액의 통화를 선택해주세요.');
 if(p.personalAmount==null)p.personalCurrency=null;
 const comparable=p.personalCurrency===p.currency?p.amount:p.personalCurrency===p.settledCurrency?p.settledAmount:null;
 if(p.personalAmount!=null&&comparable!=null&&p.personalAmount>comparable)throw new ApiError(400,'내 부담액이 같은 통화의 실제 결제·정산 금액보다 큽니다.');
 if(p.entryType==='refund'||!p.plannedDate){p.plannedDate=p.entryType==='refund'?'':p.plannedDate;p.plannedKey='';p.plannedAmount=null;p.plannedCurrency=null;p.plannedVersionId=null;p.plannedPersonalAmount=null;}
 else{
  const unchanged=old?.plannedDate===p.plannedDate&&old?.subscriptionId===p.subscriptionId&&old?.entryType!=='refund';
  if(unchanged&&old){
   const currency=old.plannedCurrency||old.currency;
   if(p.currency!==currency)throw new ApiError(400,'연결된 과거 청구의 통화와 다릅니다. 정산 통화는 별도로 기록해주세요.');
   for(const k of ['plannedKey','plannedAmount','plannedVersionId','plannedPersonalAmount'])p[k]=old[k]??null;
   p.plannedKey=p.plannedKey||occurrenceKey(c,p.plannedDate);p.plannedCurrency=currency;
  }else{
   const due=summarizeContracts([c],p.plannedDate,p.plannedDate).schedule[0];
   if(!due||due.termsUncertain)throw new ApiError(400,'조건 이력에서 확인되는 청구일을 선택해주세요.');
   if(p.currency!==due.currency)throw new ApiError(400,'연결하는 청구와 결제의 통화가 다릅니다. 정산 통화는 별도 항목에 기록해주세요.');
   p.plannedKey=occurrenceKey(c,p.plannedDate);p.plannedAmount=due.amount;p.plannedCurrency=due.currency;p.plannedVersionId=due.versionId||null;p.plannedPersonalAmount=due.personalShare??null;
  }
  if(await one("SELECT id FROM private_records WHERE user_id=? AND kind='payment' AND id!=? AND json_extract(payload,'$.plannedKey')=?",userId,recordId,p.plannedKey))throw new ApiError(409,'이 청구에 연결된 결제가 이미 있습니다. 기존 결제 기록을 수정해주세요.');
 }
 const children=await rows<{payload:string}>("SELECT payload FROM private_records WHERE user_id=? AND kind='payment' AND json_extract(payload,'$.refundOfId')=?",userId,recordId),refunds=children.map(r=>JSON.parse(r.payload) as Payment);
 if(p.entryType==='refund'){
  if(refunds.length)throw new ApiError(400,'환불이 연결된 원 결제를 환불로 변경할 수 없습니다.');
  const original=await owned(userId,p.refundOfId,'payment'),charge=original?JSON.parse(original.payload):null;
  if(!charge||charge.entryType==='refund'||charge.currency!==p.currency||charge.subscriptionId!==p.subscriptionId||p.date<charge.date||p.refundOfId===recordId)throw new ApiError(400,'환불의 원 결제, 통화, 처리일을 확인해주세요.');
  if(p.personalAmount!=null&&charge.personalCurrency&&p.personalCurrency!==charge.personalCurrency)throw new ApiError(400,'내 환불액은 원 결제의 개인 부담 통화와 같아야 합니다.');
  const others=(await rows<{payload:string}>("SELECT payload FROM private_records WHERE user_id=? AND kind='payment' AND id!=? AND json_extract(payload,'$.refundOfId')=?",userId,recordId,p.refundOfId)).map(r=>JSON.parse(r.payload));
  if(p.amount+others.reduce((n,r)=>n+r.amount,0)>charge.amount)throw new ApiError(400,'원 결제의 남은 금액보다 환불 금액이 큽니다.');
  if(p.personalAmount!=null&&charge.personalAmount!=null&&p.personalCurrency===charge.personalCurrency&&p.personalAmount+others.filter(r=>r.personalCurrency===p.personalCurrency).reduce((n,r)=>n+(r.personalAmount??0),0)>charge.personalAmount)throw new ApiError(400,'내 환불액이 원 결제에서 부담한 금액을 초과합니다.');
 }else{
  p.refundOfId='';
  if(refunds.length){
   if(p.amount<refunds.reduce((n,r)=>n+r.amount,0)||old?.currency!==p.currency||old?.subscriptionId!==p.subscriptionId||old?.date!==p.date)throw new ApiError(400,'연결된 환불과 맞지 않습니다. 환불 기록을 먼저 확인해주세요.');
   if(p.personalCurrency&&refunds.some(r=>r.personalAmount!=null&&r.personalCurrency!==p.personalCurrency))throw new ApiError(400,'내 환불액이 연결되어 있습니다. 개인 정산 통화를 먼저 확인해주세요.');
   if(p.personalAmount!=null&&refunds.filter(r=>r.personalCurrency===p.personalCurrency).reduce((n,r)=>n+(r.personalAmount??0),0)>p.personalAmount)throw new ApiError(400,'내 부담액이 이미 기록한 내 환불액보다 작습니다.');
  }
 }
}
