import {z} from 'zod';
import {billingIdentity,billingReport,contractTermsAt,currencies,horizonEndDate,paymentDates,validDate,today,type Contract,type Payment} from './billing';

const date=z.string().refine(validDate,'날짜를 확인해주세요.');
const amount=z.number().int().min(0).max(1e12).nullable();
const currency=z.enum(currencies);
const answer=z.enum(['yes','no','unknown']);
export const comparisonSchema=z.object({
 from:date,until:date,switchDate:date,oldBilling:z.enum(['stop','through','keep','unknown']),oldLastChargeDate:date.nullable(),oldAccess:z.enum(['ends','continues','unknown']),oldAccessUntil:date.nullable(),
 candidate:z.object({name:z.string().trim().min(1).max(100),amount,currency,cycle:z.enum(['monthly','quarterly','annual','custom','manual']),cycleMonths:z.number().int().min(1).max(120).nullable().optional(),nextDate:date.nullable(),anchorDate:date.nullable().optional(),amountBasis:z.enum(['total','perSeat','unknown']),seats:z.number().int().min(1).max(100000).nullable().optional(),taxStatus:z.enum(['included','excluded','unknown']),taxAmount:amount.optional(),pricingMode:z.enum(['fixed','usage','hybrid']),priceChangesAt:date.nullable().optional(),renewalAmount:amount.optional()}),
 adjustments:z.array(z.object({id:z.string().min(1).max(100),type:z.enum(['fee','refund','proration']),scenario:z.enum(['keep','change']),date:date.nullable(),amount,currency,confirmed:z.boolean(),source:z.string().trim().max(500),recordedPaymentId:z.string().max(100).optional()})).max(40),
 extrasConfirmed:z.boolean(),quoteSource:z.string().trim().max(500),quoteCheckedAt:date.nullable(),
 criteria:z.object({keepFit:answer,changeFit:answer,eligibility:answer,changeWilling:answer,budgets:z.object({KRW:amount.optional(),USD:amount.optional(),EUR:amount.optional(),JPY:amount.optional()})}),
});
export type ComparisonInput=z.infer<typeof comparisonSchema>;
export type CostEvent={date:string;amount:number|null;currency:string;kind:'actual'|'old'|'new'|'fee'|'refund'|'proration';label:string;paymentId?:string;versionId?:string|null};
type Vector=Record<string,number>;
const labels={unknown:'계약 금액',unknownRemaining:'잔여 청구 횟수',unknownDates:'다음 청구일',unknownFutureAmounts:'예정 청구 금액',unknownTax:'세금',variable:'사용량 추가 요금',unknownRenewal:'갱신 여부',unknownPause:'일시 중지 중 청구',unknownHistory:'과거 조건',pendingTerms:'확인 대기 중인 조건',conflictingHistory:'번들 조건 충돌'};
function add(v:Vector,c:string,n:number){const sum=(v[c]||0)+n;if(!Number.isSafeInteger(n)||!Number.isSafeInteger(sum))throw new Error('계산 금액이 안전한 범위를 벗어났습니다.');v[c]=sum;}
function before(date:string){return new Date(new Date(date+'T00:00:00Z').getTime()-86400000).toISOString().slice(0,10);}
function warnings(summary:ReturnType<typeof billingReport>['summary']){return Object.entries(labels).filter(([key])=>summary[key as keyof typeof labels]>0).map(([,label])=>label+' 확인 필요');}
function scenario(events:CostEvent[],issues:string[],from:string,until:string,asOf:string,budgets:ComparisonInput['criteria']['budgets'],answers:string[]){
 const total:Vector={},daily:Record<string,Vector>={},selected=events.filter(e=>e.date>=from&&e.date<=until).sort((a,b)=>a.date.localeCompare(b.date));
 for(const e of selected)if(e.amount!=null)add(total,e.currency,e.amount);
 // Required cash is gross scheduled outflow on a date, never netted against a refund.
 for(const e of events)if(e.kind!=='actual'&&e.date>=asOf&&e.date<=until&&e.amount!=null&&e.amount>0)add(daily[e.date]??={},e.currency,e.amount);
 const peak:Record<string,{date:string;amount:number}>={};for(const [date,values] of Object.entries(daily).sort())for(const [c,n] of Object.entries(values))if(!peak[c]||n>peak[c].amount)peak[c]={date,amount:n};
 const unknownEvents=events.some(e=>e.kind!=='actual'&&e.date>=asOf&&e.date<=until&&e.amount==null);
 const reasons=[...new Set(issues)];if(unknownEvents&&!reasons.includes('예정 청구 금액 확인 필요'))reasons.push('예정 청구 금액 확인 필요');
 const complete=reasons.length===0,cashOver=Object.entries(peak).some(([c,p])=>budgets[c as keyof typeof budgets]!=null&&p.amount>budgets[c as keyof typeof budgets]!),cashUnknown=Object.keys(peak).some(c=>budgets[c as keyof typeof budgets]==null);
 const feasible=answers.includes('no')||cashOver?false:answers.includes('unknown')||cashUnknown||!complete?null:true;
 return {total,events:selected,preparation:events.filter(e=>e.kind!=='actual'&&e.date>=asOf&&e.date<from).sort((a,b)=>a.date.localeCompare(b.date)),peak,complete,issues:reasons,feasible,cashOver,cashUnknown};
}
export function datedComparison(contracts:Contract[],allPayments:Payment[],raw:ComparisonInput,asOf=today()){
 const parsed=comparisonSchema.safeParse(raw);if(!parsed.success)throw new Error(parsed.error.issues[0]?.message||'비교 조건을 확인해주세요.');const v=parsed.data;
 if(!validDate(asOf)||v.from>v.until||v.switchDate<asOf||v.switchDate>v.until||v.until>horizonEndDate(asOf,120)||v.until>horizonEndDate(v.from,120))throw new Error('전환일은 오늘 이후, 비교 종료일 이전이어야 합니다. 비교 기간은 최대 10년입니다.');
 if(!contracts.length||new Set(contracts.map(billingIdentity)).size!==1)throw new Error('동일한 계약 또는 번들을 선택해주세요.');
 if(v.candidate.nextDate&&v.candidate.nextDate<v.switchDate||v.candidate.anchorDate&&v.candidate.nextDate&&v.candidate.anchorDate>v.candidate.nextDate)throw new Error('새 계약의 첫 청구일과 기준일을 확인해주세요.');
 if(v.candidate.anchorDate&&v.candidate.nextDate&&v.candidate.cycle!=='manual'&&!paymentDates(v.candidate.anchorDate,v.candidate.cycle,v.candidate.nextDate,v.candidate.cycleMonths,v.candidate.anchorDate).includes(v.candidate.nextDate))throw new Error('첫 청구일이 기준일·결제 주기와 맞지 않습니다.');
 if(v.candidate.cycle==='custom'&&!v.candidate.cycleMonths)throw new Error('새 계약의 결제 주기를 입력해주세요.');
 if(v.candidate.priceChangesAt&&v.candidate.priceChangesAt<v.switchDate)throw new Error('정상가 적용일은 전환일 이후여야 합니다.');
 if(v.oldBilling==='through'&&(!v.oldLastChargeDate||v.oldLastChargeDate<v.switchDate))throw new Error('변경 후 기존 계약의 마지막 청구일을 입력해주세요.');
 if(v.oldAccess==='ends'&&!v.oldAccessUntil)throw new Error('기존 계약의 이용 종료일을 입력해주세요.');
 if(v.quoteCheckedAt&&v.quoteCheckedAt>asOf)throw new Error('요금 확인일은 미래일 수 없습니다.');
 if(new Set(v.adjustments.map(a=>a.id)).size!==v.adjustments.length)throw new Error('추가 금액 항목이 중복되었습니다.');
 const payments=allPayments.filter(p=>contracts.some(c=>c.id===p.subscriptionId));
 const actual:CostEvent[]=payments.filter(p=>p.date>=v.from&&p.date<=v.until).map(p=>({date:p.date,amount:p.amount*(p.entryType==='refund'?-1:1),currency:p.currency,kind:'actual',label:p.entryType==='refund'?'기록된 환불':'기록된 결제',paymentId:p.id}));
 const report=billingReport(contracts,payments,asOf,v.until,asOf),old:CostEvent[]=report.schedule.filter(d=>d.state==='expected').map(d=>({date:d.date,amount:d.amount,currency:d.currency,kind:'old',label:'기존 계약 청구',versionId:d.versionId}));
 const past=v.from<asOf?billingReport(contracts,payments,v.from,before(asOf),asOf):null,commonIssues:string[]=[];
 if(payments.some(p=>p.date>asOf&&(p.date<=v.until||p.plannedDate&&p.plannedDate>=asOf&&p.plannedDate<=v.until)))commonIssues.push('미래일로 기록된 실제 결제·환불 확인 필요');
 if(past?.unconfirmed)commonIssues.push('과거 청구 '+past.unconfirmed+'회 결제 대사 필요');if(past?.summary.unknownHistory)commonIssues.push('과거 조건 확인 필요');
 if(!v.extrasConfirmed)commonIssues.push('추가 비용·환불·일할 정산 조건 확인 필요');
 const cutoff=v.oldBilling==='stop'?before(v.switchDate):v.oldBilling==='through'?v.oldLastChargeDate!:v.until;
 const keepIssues=[...commonIssues,...warnings(report.summary)],changeIssues=[...commonIssues];
 if(cutoff>=asOf)changeIssues.push(...warnings(billingReport(contracts,payments,asOf,cutoff<v.until?cutoff:v.until,asOf).summary));
 if(v.oldBilling==='unknown')changeIssues.push('변경 후 기존 청구 종료일 확인 필요');
 const newContract:Contract={...v.candidate,id:'new-comparison-contract',status:'active'},newReport=billingReport([newContract],[],v.switchDate,v.until,asOf);
 changeIssues.push(...warnings(newReport.summary).map(s=>'새 계약: '+s));
 if(!v.quoteSource||!v.quoteCheckedAt)changeIssues.push('새 요금 출처·확인일 필요');
 const keepEvents=[...actual,...old],changeEvents=[...actual,...old.filter(e=>e.date<=cutoff),...newReport.schedule.map(d=>({date:d.date,amount:d.amount,currency:d.currency,kind:'new' as const,label:v.candidate.name}))];
 const linkedRefunds=new Set<string>();
 for(const a of v.adjustments){
  if(a.recordedPaymentId){const p=payments.find(p=>p.id===a.recordedPaymentId&&p.entryType==='refund');if(a.type!=='refund'||!p||linkedRefunds.has(p.id))throw new Error('이미 기록된 환불 연결을 확인해주세요.');linkedRefunds.add(p.id);continue;}
  if(a.date&&a.date<asOf)throw new Error('이미 발생한 비용·환불은 결제 기록에 추가한 뒤 연결해주세요.');
  const issues=a.scenario==='keep'?keepIssues:changeIssues,events=a.scenario==='keep'?keepEvents:changeEvents;
  if(a.type==='refund'&&payments.some(p=>p.entryType==='refund'&&p.date===a.date&&p.currency===a.currency&&p.amount===a.amount)){issues.push('같은 날짜·금액의 원장 환불을 연결해주세요. 중복 여부 확인 필요');continue;}
  if(!a.confirmed||!a.source||a.date==null||a.amount==null){issues.push((a.type==='refund'?'환불':a.type==='proration'?'일할 추가 정산':'수수료')+' 금액·날짜·근거 확인 필요');continue;}
  events.push({date:a.date,amount:a.amount*(a.type==='refund'?-1:1),currency:a.currency,kind:a.type,label:a.type==='refund'?'확인된 예상 환불':a.type==='proration'?'일할 추가 정산':'전환 수수료'});
 }
 const keep=scenario(keepEvents,keepIssues,v.from,v.until,asOf,v.criteria.budgets,[v.criteria.keepFit]),change=scenario(changeEvents,changeIssues,v.from,v.until,asOf,v.criteria.budgets,[v.criteria.changeFit,v.criteria.eligibility,v.criteria.changeWilling]);
 const lastTerms=contractTermsAt(contracts[0],v.until),coverageConflict=!!lastTerms?.endDate&&lastTerms.endDate<v.until;
 if(coverageConflict)keep.feasible=false;
 const seenCurrencies=[...new Set([...Object.keys(keep.total),...Object.keys(change.total),...old.map(e=>e.currency),...newReport.schedule.map(e=>e.currency)])].sort(),difference:Vector={};for(const c of seenCurrencies)add(difference,c,(keep.total[c]||0)-(change.total[c]||0));
 const preparationOutsidePeriod=keep.preparation.length>0||change.preparation.length>0;
 const comparable=keep.complete&&change.complete&&seenCurrencies.length===1&&!preparationOutsidePeriod,delta=comparable?difference[seenCurrencies[0]]:null,cheaper=delta==null?null:delta>0?'change':delta<0?'keep':'equal';
 let recommendation:'keep'|'change'|null=null;
 if(comparable&&keep.feasible!=null&&change.feasible!=null){if(keep.feasible&&change.feasible)recommendation=cheaper==='change'?'change':'keep';else if(keep.feasible)recommendation='keep';else if(change.feasible)recommendation='change';}
 const accessEnd=v.oldAccess==='continues'?v.until:v.oldAccess==='ends'?v.oldAccessUntil:null,overlapEnd=accessEnd&&accessEnd<v.until?accessEnd:v.until;
 const overlap=accessEnd?{from:v.switchDate,until:overlapEnd,days:Math.max(0,Math.round((new Date(overlapEnd+'T00:00:00Z').getTime()-new Date(v.switchDate+'T00:00:00Z').getTime())/86400000)+1)}:null;
 return {schemaVersion:1 as const,asOf,from:v.from,until:v.until,switchDate:v.switchDate,keep:{...keep,coverageConflict},change:{...change,coverageConflict:false},overlap,preparationOutsidePeriod,currencies:seenCurrencies,difference,cheaper,recommendation,commonActual:actual,linkedRefunds:[...linkedRefunds]};
}
export type ComparisonResult=ReturnType<typeof datedComparison>;
