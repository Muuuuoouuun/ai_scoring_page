export type Cycle = 'monthly' | 'quarterly' | 'annual' | 'custom' | 'manual';
export type Contract = { id: string; amount: number | null; currency: string; cycle: Cycle; cycleMonths?:number|null; anchorDate?:string|null; nextDate: string|null; status: string; bundleId?: string | null; remainingPayments?: number | null; endDate?: string | null; amountBasis?:'total'|'perSeat'|'unknown'; seats?:number|null; taxStatus?:'included'|'excluded'|'unknown'; taxAmount?:number|null; priceChangesAt?:string|null; renewalAmount?:number|null; pricingMode?:'fixed'|'usage'|'hybrid'; usageBudget?:number|null; personalShare?:number|null; pauseBilling?:'continues'|'stops'|'unknown'; resumeDate?:string|null; remainingFromDate?:string|null; plan?:string; termsHistory?:TermsHistory };
export type Terms = Omit<Contract,'id'|'bundleId'|'termsHistory'>;
export type TermsVersion={id:string;recordedAt:string;effectiveFrom:string|null;state:'confirmed'|'draft'|'void';terms:Terms;reason:string;sourceNote?:string;supersedes?:string;uncertainFrom?:string|null;basis?:'observed'|'effective'};
export type TermsHistory={schemaVersion:1;revision:number;knownFrom:string;versions:TermsVersion[];legacySnapshot?:Record<string,unknown>};
export type Due={contractId:string;date:string;amount:number|null;currency:string;personalShare?:number|null;versionId?:string|null;termsUncertain?:boolean};
const months: Partial<Record<Cycle, number>> = {monthly:1,quarterly:3,annual:12};
export const currencies = ['KRW','USD','EUR','JPY'] as const;
export function toMinor(value: string | number, currency: string): number {
  const number=Number(value), scale=['KRW','JPY'].includes(currency)?1:100;
  if(String(value).trim()==='' || !Number.isFinite(number) || number<0 || number>1e10) throw new Error('금액을 확인해주세요.');
  return Math.round(number*scale);
}
export function fromMinor(value: number, currency: string) { return value/(['KRW','JPY'].includes(currency)?1:100); }
export function money(value: number, currency: string) { return new Intl.NumberFormat('ko-KR',{style:'currency',currency,maximumFractionDigits:['KRW','JPY'].includes(currency)?0:2}).format(fromMinor(value,currency)); }
export function validDate(value: string) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const d=new Date(value+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;
}
export function today() { return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }
export function monthAfter(value: string, count: number) {
  if(!validDate(value)||!Number.isInteger(count)||count<0||count>1200)throw new Error('기간을 확인해주세요.');
  const d=new Date(value+'T00:00:00Z'), day=d.getUTCDate();
  const target=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+count,1));
  const last=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();
  target.setUTCDate(Math.min(day,last));return target.toISOString().slice(0,10);
}
export function horizonEndDate(from:string,count:number){
  if(count<1)throw new Error('기간을 확인해주세요.');
  const boundary=new Date(monthAfter(from,count)+'T00:00:00Z');
  boundary.setUTCDate(boundary.getUTCDate()-1);return boundary.toISOString().slice(0,10);
}
export function cycleLength(c:Pick<Contract,'cycle'|'cycleMonths'>){return c.cycle==='custom'?c.cycleMonths||null:months[c.cycle]||null;}
export function paymentDates(next:string,cycle:Cycle,until:string,cycleMonths?:number|null,anchorDate?:string|null){
 if(!validDate(next)||!validDate(until))throw new Error('결제일을 확인해주세요.');
 if(cycle==='manual')return next<=until?[next]:[];
 const step=cycleLength({cycle,cycleMonths});if(!step||!Number.isInteger(step)||step<1||step>120)throw new Error('결제 주기를 확인해주세요.');
 const anchor=anchorDate&&validDate(anchorDate)?anchorDate:next,result:string[]=[];
 for(let i=0;i*step<=1200;i++){const d=monthAfter(anchor,i*step);if(d>until)break;if(d>=next)result.push(d);}
 return result;
}
function summarizeLegacyContracts(contracts: Contract[], from: string, until: string) {
  if(!validDate(from)||!validDate(until)||until<from)throw new Error('조회 기간을 확인해주세요.');
  const totals: Record<string,{monthly:number;expected:number;count:number}>={}, seen=new Set<string>();
  let unknown=0,unknownRemaining=0,unknownDates=0,unknownFutureAmounts=0,unknownTax=0,variable=0,unknownRenewal=0,unknownPause=0;
  const schedule: {contractId:string;date:string;amount:number|null;currency:string}[]=[];
  for(const c of [...contracts].sort((a,b)=>Number(a.amount==null)-Number(b.amount==null)||a.id.localeCompare(b.id))){
    const uncertainPause=c.status==='paused'&&(!c.pauseBilling||c.pauseBilling==='unknown');
    const renewing=c.status==='active'||c.status==='cancel_requested'||c.status==='paused'&&!uncertainPause;
    if(c.status==='unknown'){unknownRenewal++;if(c.remainingPayments==null)continue;}
    if(uncertainPause){unknownPause++;if(c.remainingPayments==null)continue;}
    const remaining=c.remainingPayments;
    if(renewing&&c.endDate&&c.endDate<from)continue;
    if(!renewing&&remaining===0)continue;
    if(c.bundleId){if(seen.has(c.bundleId))continue;seen.add(c.bundleId);}
    if(!renewing&&remaining==null){unknownRemaining++;continue;}
    const amount=contractAmount(c,from);
    if(c.pricingMode==='usage'||c.pricingMode==='hybrid')variable++;
    if(!c.taxStatus||c.taxStatus==='unknown'||c.taxStatus==='excluded'&&c.taxAmount==null)unknownTax++;
    if(amount==null)unknown++;
    else{const t=totals[c.currency]??={monthly:0,expected:0,count:0};t.count++;const length=cycleLength(c);if(renewing&&length&&!(c.status==='paused'&&c.pauseBilling==='stops'&&(!c.resumeDate||from<c.resumeDate)))t.monthly+=amount/length;}
    if(!c.nextDate){unknownDates++;continue;}
    let dates=paymentDates(c.nextDate,c.cycle,until,c.cycleMonths,c.anchorDate);
    if(!renewing)dates=dates.slice(0,remaining!);
    for(const date of dates){if(date<from)continue;if(c.status==='paused'&&c.pauseBilling==='stops'&&(!c.resumeDate||date<c.resumeDate))continue;if(renewing&&c.endDate&&date>c.endDate)continue;const due=contractAmount(c,date);if(due!=null){const total=totals[c.currency]??={monthly:0,expected:0,count:0};total.expected+=due;}else unknownFutureAmounts++;schedule.push({contractId:c.id,date,amount:due,currency:c.currency});}
  }
  return {currencies:totals,unknown,unknownRemaining,unknownDates,unknownFutureAmounts,unknownTax,variable,unknownRenewal,unknownPause,schedule:schedule.sort((a,b)=>a.date.localeCompare(b.date))};
}
export function comparePeriods(monthly: number, annual: number, duration: number, prepaymentLimit?:number|null) {
  if(!Number.isFinite(monthly)||!Number.isFinite(annual)||monthly<0||annual<0||!Number.isInteger(duration)||duration<1||duration>120)throw new Error('금액과 사용 기간을 확인해주세요.');
  const monthlyTotal=monthly*duration,annualTotal=annual*Math.ceil(duration/12);
  if(prepaymentLimit!=null&&(!Number.isFinite(prepaymentLimit)||prepaymentLimit<0))throw new Error('선결제 한도를 확인해주세요.');
  const recommended=monthlyTotal<=annualTotal?'monthly':'annual';
  const annualEligible=prepaymentLimit==null?null:annual<=prepaymentLimit;
  const feasibleRecommendation=prepaymentLimit==null?null:Math.min(monthly,annual)>prepaymentLimit?null:annualEligible&&annualTotal<monthlyTotal?'annual':monthly<=prepaymentLimit?'monthly':null;
  return {monthlyTotal,annualTotal,difference:monthlyTotal-annualTotal,upfront:annual,recommended,...prepaymentLimit!==undefined?{annualEligible,feasibleRecommendation}:{}};
}

export function contractAmount(c:Contract,date:string):number|null{
 if(c.termsHistory){if(pendingTerms(c.termsHistory).some(v=>v.uncertainFrom&&v.uncertainFrom<=date))return null;const terms=contractTermsAt(c,date);return terms?contractAmount(terms,date):null;}
 if(c.pricingMode==='usage'||c.amountBasis==='unknown')return null;
 let value=c.priceChangesAt&&date>=c.priceChangesAt?c.renewalAmount:c.amount;
 if(value==null)return null;
 if(c.amountBasis==='perSeat'){if(c.seats==null)return null;value*=c.seats;}
 if(c.taxStatus==='excluded'&&c.taxAmount!=null)value+=c.taxAmount;
 return Number.isSafeInteger(value)?value:null;
}
export type Payment={id:string;subscriptionId?:string;plannedDate?:string|null;plannedKey?:string;plannedAmount?:number|null;refundOfId?:string;date:string;amount:number;currency:string;entryType?:'charge'|'refund';settledAmount?:number|null;settledCurrency?:string;feeAmount?:number|null;personalAmount?:number|null;personalCurrency?:string|null;plannedCurrency?:string|null;plannedVersionId?:string|null;plannedPersonalAmount?:number|null};
export function actualTotals(payments:Payment[],from:string,until:string,settlement=false){
 const totals:Record<string,number>={};
 for(const p of payments){if(p.date<from||p.date>until)continue;const settled=settlement&&p.settledAmount!=null&&p.settledCurrency;const currency=settled?p.settledCurrency!:p.currency,amount=settled?p.settledAmount!:p.amount;addMoney(totals,currency,amount*(p.entryType==='refund'?-1:1));}
 return totals;
}

export function billingIdentity(c:Pick<Contract,'id'|'bundleId'>){return c.bundleId?'bundle:'+c.bundleId:'contract:'+c.id;}
export function occurrenceKey(c:Pick<Contract,'id'|'bundleId'>,date:string){return billingIdentity(c)+'@'+date;}
export function billingReport(contracts:Contract[],payments:Payment[],from:string,until:string,asOf=today()){
 const summary=summarizeContracts(contracts,from,until),actual=actualTotals(payments,from,until),remaining:Record<string,number>={},personal:Record<string,number>={},personalActual:Record<string,number>={},personalRemaining:Record<string,number>={};
 const matched=new Map<string,Payment>();
 for(const p of payments){if(p.entryType==='refund'||!p.plannedDate)continue;const c=contracts.find(c=>c.id===p.subscriptionId);if(c)matched.set(p.plannedKey||occurrenceKey(c,p.plannedDate),p);}
 const dueRows:Due[]=[...summary.schedule];
 // A later condition correction cannot erase the recorded invoice association.
 for(const [key,p] of matched){const c=contracts.find(c=>c.id===p.subscriptionId);if(!c||!p.plannedDate||p.plannedDate<from||p.plannedDate>until||dueRows.some(d=>occurrenceKey(contracts.find(c=>c.id===d.contractId)!,d.date)===key))continue;dueRows.push({contractId:c.id,date:p.plannedDate,amount:p.plannedAmount??null,currency:p.plannedCurrency||p.currency,personalShare:p.plannedPersonalAmount??null,versionId:p.plannedVersionId||null});}
 let unconfirmed=0,unknownShares=0,unknownPersonalActual=0,unknownPersonalRemaining=0;
 for(const p of payments){if(p.date<from||p.date>until)continue;if(p.personalAmount==null||!p.personalCurrency)unknownPersonalActual++;else addMoney(personalActual,p.personalCurrency,p.personalAmount*(p.entryType==='refund'?-1:1));}
 const schedule=dueRows.sort((a,b)=>a.date.localeCompare(b.date)).map(d=>{const c=contracts.find(c=>c.id===d.contractId)!,key=occurrenceKey(c,d.date),p=matched.get(key),state=p?'confirmed':d.date<asOf?'unconfirmed':'expected';
  if(state==='unconfirmed')unconfirmed++;
  if(state==='expected'&&d.amount!=null)addMoney(remaining,d.currency,d.amount);
  const capturedShare=p?p.plannedPersonalAmount??null:d.personalShare,capturedCurrency=p?.plannedCurrency||p?.currency||d.currency;
  if(capturedShare==null)unknownShares++;else addMoney(personal,capturedCurrency,capturedShare);
  if(state==='expected'){if(d.personalShare==null||d.termsUncertain)unknownPersonalRemaining++;else addMoney(personalRemaining,d.currency,d.personalShare);}
  const planned=p?.plannedAmount===undefined?d.amount:p.plannedAmount,plannedCurrency=p?.plannedCurrency||d.currency;
  return {...d,key,state,personalShare:capturedShare,currentPersonalShare:d.personalShare,amount:p?planned:d.amount,currency:p?plannedCurrency:d.currency,currentAmount:d.amount,currentCurrency:d.currency,versionId:p?.plannedVersionId||d.versionId,paymentId:p?.id,actualDate:p?.date,actualAmount:p?.amount,actualCurrency:p?.currency,difference:p&&planned!=null&&p.currency===plannedCurrency?p.amount-planned:null};
 });
 const forecast={...actual};for(const [c,n] of Object.entries(remaining))addMoney(forecast,c,n);
 const personalForecast={...personalActual};for(const [c,n] of Object.entries(personalRemaining))addMoney(personalForecast,c,n);
 const monthly:Record<string,{actual:Record<string,number>;expected:Record<string,number>}>={};
 for(const p of payments){if(p.date<from||p.date>until)continue;const m=monthly[p.date.slice(0,7)]??={actual:{},expected:{}};addMoney(m.actual,p.currency,p.amount*(p.entryType==='refund'?-1:1));}
 for(const d of schedule){if(d.state!=='expected'||d.amount==null)continue;const m=monthly[d.date.slice(0,7)]??={actual:{},expected:{}};addMoney(m.expected,d.currency,d.amount);}
 return {summary,actual,remaining,forecast,personal,unknownShares,personalActual,personalRemaining,personalForecast,unknownPersonalActual,unknownPersonalRemaining,unconfirmed,schedule,monthly};
}
export function transitionComparison(monthly:number,annual:number,duration:number,costs:{overlap:number|null;transition:number|null;refund:number|null},limit?:number|null){
 const base=comparePeriods(monthly,annual,duration,limit),values=Object.values(costs);
 if(values.some(n=>n!=null&&(!Number.isSafeInteger(n)||n<0)))throw new Error('추가 비용을 확인해주세요.');
 const adjustedAnnual=base.annualTotal+(costs.overlap??0)+(costs.transition??0)-(costs.refund??0),complete=values.every(n=>n!=null);
 const upfront=annual+(costs.overlap??0)+(costs.transition??0),annualEligible=limit==null||!complete?null:upfront<=limit;
 const feasibleRecommendation=limit==null||!complete?null:annualEligible&&adjustedAnnual<base.monthlyTotal?'annual':monthly<=limit?'monthly':annualEligible?'annual':null;
 return {...base,upfront,annualEligible,feasibleRecommendation,adjustedAnnual,difference:base.monthlyTotal-adjustedAnnual,complete,recommended:base.monthlyTotal<=adjustedAnnual?'monthly':'annual'};
}

function addMoney(totals:Record<string,number>,currency:string,amount:number){
 const total=(totals[currency]||0)+amount;if(!Number.isSafeInteger(amount)||!Number.isSafeInteger(total))throw new Error('계산 금액이 안전한 범위를 벗어났습니다. 기록을 확인해주세요.');totals[currency]=total;
}
export function supersededTerms(history:TermsHistory){
 const replaced=new Set<string>(),byId=new Map(history.versions.map(v=>[v.id,v]));
 for(const v of history.versions){
  if(!v.supersedes)continue;
  let target=byId.get(v.supersedes);const visited=new Set<string>();
  while(target&&!visited.has(target.id)){
   visited.add(target.id);
   if(v.state==='draft'&&target.state!=='draft'||v.state==='void'&&byId.get(v.supersedes)?.state==='draft'&&target.state!=='draft')break;
   replaced.add(target.id);target=target.supersedes?byId.get(target.supersedes):undefined;
  }
 }
 return replaced;
}
export function activeTerms(history:TermsHistory){
 const replaced=supersededTerms(history);
 return history.versions.filter(v=>v.state==='confirmed'&&v.effectiveFrom&&validDate(v.effectiveFrom)&&!replaced.has(v.id)).sort((a,b)=>a.effectiveFrom!.localeCompare(b.effectiveFrom!));
}
export function pendingTerms(history:TermsHistory){const replaced=supersededTerms(history);return history.versions.filter(v=>v.state==='draft'&&!replaced.has(v.id));}
function stableValue(value:unknown):string{if(Array.isArray(value))return '['+value.map(stableValue).join(',')+']';if(value&&typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+stableValue(v)).join(',')+'}';return JSON.stringify(value);}
export function termsVersionAt(c:Contract,date:string){if(!c.termsHistory||date<c.termsHistory.knownFrom)return null;return activeTerms(c.termsHistory).filter(v=>v.effectiveFrom!<=date).at(-1)||null;}
export function contractTermsAt(c:Contract,date:string):Contract|null{
 if(!c.termsHistory)return c;const v=termsVersionAt(c,date);return v?{...c,...v.terms,termsHistory:undefined,priceChangesAt:null,renewalAmount:null}:null;
}
export function summarizeContracts(contracts:Contract[],from:string,until:string){
 if(!validDate(from)||!validDate(until)||until<from)throw new Error('조회 기간을 확인해주세요.');
 const currencies:Record<string,{monthly:number;expected:number;count:number}>={},schedule:Due[]=[];
 const warnings={unknown:0,unknownRemaining:0,unknownDates:0,unknownFutureAmounts:0,unknownTax:0,variable:0,unknownRenewal:0,unknownPause:0,unknownHistory:0,pendingTerms:0,conflictingHistory:0};
 const identities=new Map<string,Contract[]>();for(const c of contracts){const k=billingIdentity(c),items=identities.get(k)||[];items.push(c);identities.set(k,items);}
 for(const members of identities.values()){
  const c=[...members].sort((a,b)=>Number(a.amount==null)-Number(b.amount==null)||a.id.localeCompare(b.id))[0],history=c.termsHistory;
  if(members.some(m=>stableValue(m.termsHistory||null)!==stableValue(history||null))){warnings.conflictingHistory++;continue;}
  if(!history&&members.some(m=>m.amount!=null&&c.amount!=null&&m.amount!==c.amount||(['currency','cycle','cycleMonths','anchorDate','nextDate','status','remainingPayments','endDate','personalShare','amountBasis','seats','taxStatus','taxAmount','priceChangesAt','renewalAmount','pauseBilling','resumeDate'] as const).some(k=>(m[k]??null)!==(c[k]??null)))){warnings.conflictingHistory++;continue;}
  if(!history){const legacy=summarizeLegacyContracts([c],from,until);for(const k of Object.keys(legacy.currencies)){const total=currencies[k]??={monthly:0,expected:0,count:0};total.monthly+=legacy.currencies[k].monthly;total.count+=legacy.currencies[k].count;const sum=total.expected+legacy.currencies[k].expected;if(!Number.isSafeInteger(sum))throw new Error('계산 금액이 안전한 범위를 벗어났습니다.');total.expected=sum;}for(const key of ['unknown','unknownRemaining','unknownDates','unknownFutureAmounts','unknownTax','variable','unknownRenewal','unknownPause'] as const)warnings[key]+=legacy[key];schedule.push(...legacy.schedule.map(d=>({...d,personalShare:c.personalShare??null,versionId:null})));continue;}
  const versions=activeTerms(history);
  if(versions.some((v,i)=>i>0&&v.effectiveFrom===versions[i-1].effectiveFrom)){warnings.conflictingHistory++;continue;}
  if(from<history.knownFrom||!versions.length||from<versions[0].effectiveFrom!)warnings.unknownHistory++;
  const pending=pendingTerms(history);warnings.pendingTerms+=pending.length;
  let current=contractTermsAt(c,from);if(current&&pending.some(v=>v.uncertainFrom&&v.uncertainFrom<=from))current={...current,amount:null};
  if(current){const head=summarizeLegacyContracts([current],from,from);for(const [currency,t] of Object.entries(head.currencies)){const total=currencies[currency]??={monthly:0,expected:0,count:0};total.monthly+=t.monthly;total.count+=t.count;}warnings.unknown+=head.unknown;}
  const usedDates:string[]=[];const flags=new Set<'unknownRemaining'|'unknownDates'|'unknownRenewal'|'unknownPause'|'unknownTax'|'variable'>();
  for(let i=0;i<versions.length;i++){
   const v=versions[i],t={...c,...v.terms,termsHistory:undefined,priceChangesAt:null,renewalAmount:null} as Contract,end=versions[i+1]?.effectiveFrom||null;
   if(v.effectiveFrom!>until)break;
   const uncertainPause=t.status==='paused'&&(!t.pauseBilling||t.pauseBilling==='unknown'),renewing=t.status==='active'||t.status==='cancel_requested'||t.status==='paused'&&!uncertainPause;
   const relevant=(!end||end>from)&&v.effectiveFrom!<=until;
   if(relevant){if(!t.taxStatus||t.taxStatus==='unknown'||t.taxStatus==='excluded'&&t.taxAmount==null)flags.add('unknownTax');if(t.pricingMode==='usage'||t.pricingMode==='hybrid')flags.add('variable');}
   if(t.status==='unknown'&&relevant)flags.add('unknownRenewal');if(uncertainPause&&relevant)flags.add('unknownPause');
   if(!renewing&&t.remainingPayments==null){if(relevant)flags.add('unknownRemaining');continue;}
   if(!t.nextDate){if(relevant)flags.add('unknownDates');continue;}
   const residualFrom=t.remainingFromDate||t.nextDate;
   if(!renewing&&residualFrom<history.knownFrom){if(relevant)flags.add('unknownRemaining');continue;}
   for(const date of paymentDates(t.nextDate,t.cycle,until,t.cycleMonths,t.anchorDate)){
    if(date<history.knownFrom||date<v.effectiveFrom!||end&&date>=end)continue;
    if(t.status==='paused'&&t.pauseBilling==='stops'&&(!t.resumeDate||date<t.resumeDate))continue;
    if(renewing&&t.endDate&&date>t.endDate)continue;
    if(!renewing&&(date<residualFrom||usedDates.filter(d=>d>=residualFrom).length>=t.remainingPayments!))continue;
    usedDates.push(date);if(date<from)continue;
    const termsUncertain=pending.some(p=>p.uncertainFrom&&p.uncertainFrom<=date),amount=termsUncertain?null:contractAmount(t,date);
    if(amount==null)warnings.unknownFutureAmounts++;else{const total=currencies[t.currency]??={monthly:0,expected:0,count:0};const sum=total.expected+amount;if(!Number.isSafeInteger(sum))throw new Error('계산 금액이 안전한 범위를 벗어났습니다.');total.expected=sum;}
    schedule.push({contractId:c.id,date,amount,currency:t.currency,personalShare:termsUncertain?null:t.personalShare??null,versionId:v.id,termsUncertain});
   }
  }
  for(const key of flags)warnings[key]++;
 }
 return {currencies,...warnings,schedule:schedule.sort((a,b)=>a.date.localeCompare(b.date)||a.contractId.localeCompare(b.contractId))};
}
