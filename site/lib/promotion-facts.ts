export type OfferPrice={amount:number|null;currency:string|null;period:string;tax:string};
export type OfferFeature={id:string;status:string;condition:string;sourceUrl:string};
export type Promotion={id:string;toolId:string;name:string;summary:string;status:string;revision?:number;reviewStatus?:string;region:string;regionCodes:string[];expiresAt:string|null;deadlineType?:'fixed'|'ongoing'|'unknown';expiresInstant?:string|null;expiresTimeZone:string|null;benefitDuration:string;benefitMonths?:number|null;price?:OfferPrice|null;renewalPrice?:OfferPrice|null;offerFeatures?:OfferFeature[];eligibility:string[];conditions:string[];url:string;sourceUrls:string[];checkedAt:string;checkedAtInstant?:string;priceNote?:string;renewalNote?:string;applicationNote?:string;eligibilityNote?:string};
export const featureLabels:Record<string,string>={'document-analysis':'문서 분석','live-conversation':'음성 대화','image-generation':'이미지 생성','offline-document-editing':'오프라인 문서 편집','external-app-integration':'외부 앱 연동','workspace-guests':'워크스페이스 게스트','file-upload-and-history':'파일 업로드·이력','unlimited-boards':'활성 보드 무제한','private-boards':'비공개 보드','code-completion':'코드 자동완성','ai-chat-model-access':'AI 대화·모델 접근','third-party-agents':'외부 제공사 에이전트'};
const clean=(v:unknown):unknown=>typeof v==='string'?v.trim().replace(/\s+/g,' '):Array.isArray(v)?v.map(clean).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,clean(x)])):v;
export const canonical=(v:unknown)=>JSON.stringify(clean(v));
export async function fingerprint(v:unknown){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(v)));return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');}
// A deterministic form token, not a signature or a claim that the user's eligibility was verified.
export const eligibilityFingerprint=(p:Promotion)=>canonical({region:p.regionCodes,eligibility:p.eligibility,conditions:p.conditions});
export function promotionMaterial(p:Promotion){return {status:p.status,reviewStatus:p.reviewStatus||'unverified',region:p.regionCodes,eligibility:p.eligibility,conditions:p.conditions,deadline:{date:p.expiresAt,instant:p.expiresInstant||null,timeZone:p.expiresTimeZone,...(p.deadlineType&&p.deadlineType!=='fixed'?{kind:p.deadlineType}:{})},price:p.price||null,renewalPrice:p.renewalPrice||null,benefitMonths:p.benefitMonths??null,benefitDuration:p.benefitDuration,features:p.offerFeatures||[],...(p.renewalNote||p.eligibilityNote?{programTerms:{renewal:p.renewalNote||null,eligibility:p.eligibilityNote||null}}:{})};}
// Internal review window for programs without a fixed application deadline.
const reviewDays=30;
function reviewStart(p:Promotion){if(p.checkedAtInstant){const match=/^(\d{4}-\d{2}-\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(p.checkedAtInstant);if(!match)return NaN;const day=Date.parse(match[1]+'T00:00:00Z');return Number.isFinite(day)&&new Date(day).toISOString().slice(0,10)===match[1]?Date.parse(p.checkedAtInstant):NaN;}const value=Date.parse(p.checkedAt+'T00:00:00Z');return /^\d{4}-\d{2}-\d{2}$/.test(p.checkedAt)&&Number.isFinite(value)&&new Date(value).toISOString().slice(0,10)===p.checkedAt?value:NaN;}
export function deadlineLabel(p:Promotion){return p.deadlineType==='ongoing'?'상시 신청 안내 · 고정 등록 마감 없음':p.expiresAt?'등록 마감 '+p.expiresAt+(p.expiresInstant?' · '+p.expiresInstant:' · 정확한 시각 미확인'):'등록 마감 미확인';}
export function deadlineState(p:Promotion,at=new Date().toISOString()):'open'|'uncertain'|'expired'{
 const t=Date.parse(at);if(!Number.isFinite(t))return 'uncertain';
 if(p.deadlineType==='ongoing'){if(p.expiresAt||p.expiresInstant)return 'uncertain';const checked=reviewStart(p);return Number.isFinite(checked)&&t>=checked&&t<checked+reviewDays*86400000?'open':'uncertain';}
 if(p.deadlineType==='unknown'||!p.expiresAt)return 'uncertain';
 const instant=p.expiresInstant||(/T/.test(p.expiresAt)?p.expiresAt:null);
 if(instant){if(!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(instant)||!Number.isFinite(Date.parse(instant)))return 'uncertain';return t>=Date.parse(instant)?'expired':'open';}
 if(!/^\d{4}-\d{2}-\d{2}$/.test(p.expiresAt)||!Number.isFinite(Date.parse(p.expiresAt)))return 'uncertain';
 const date=Date.parse(p.expiresAt+'T00:00:00Z');
 if(new Date(date).toISOString().slice(0,10)!==p.expiresAt)return 'uncertain';
 // Source only gives a date. These bounds are internal email policy, not an official cutoff.
 return t>=date+36*3600000?'expired':t>=date-14*3600000?'uncertain':'open';
}
export type OfferConstraints={maxPrice?:number|null;currency?:string;minBenefitMonths?:number|null;neededFeatures?:string[];promotionEligibility?:Record<string,string>;promotionEligibilityVersions?:Record<string,string>};
export function offerHolds(p:Promotion,s:OfferConstraints,at?:string){
 const reasons:string[]=[];
 if(p.status!=='active')reasons.push(p.status==='withdrawn'?'공식 안내 철회':'혜택 종료');
 if(p.reviewStatus!=='verified')reasons.push('공식 조건 검토 필요');
 const deadline=deadlineState(p,at);if(deadline!=='open')reasons.push(deadline==='expired'?'등록 마감 경과':p.deadlineType==='ongoing'?'최근 공식 안내 재확인 필요':'정확한 마감 시각 확인 필요');
 if(s.promotionEligibility?.[p.id]==='ineligible')reasons.push('내 설정에서 해당하지 않음');
 else if(s.promotionEligibility?.[p.id]!=='eligible'||s.promotionEligibilityVersions?.[p.id]!==eligibilityFingerprint(p))reasons.push('현재 자격 조건 재확인 필요');
 if(s.maxPrice!=null){
  const prices=[p.price,p.renewalPrice];
  if(prices.some(x=>!x||x.amount==null||x.currency!==s.currency||x.period!=='month'||x.tax!=='included'))reasons.push('세금 포함 월요금·갱신가·통화 확인 필요');
  else if(prices.some(x=>x!.amount!>s.maxPrice!))reasons.push('혜택 또는 갱신 월요금이 상한 초과');
 }
 if(s.minBenefitMonths!=null&&(p.benefitMonths==null||p.benefitMonths<s.minBenefitMonths))reasons.push('최소 혜택 기간 미충족 또는 미확인');
 for(const id of s.neededFeatures||[]){const f=p.offerFeatures?.find(f=>f.id===id);if(!f||f.status!=='supported'||!f.sourceUrl)reasons.push((featureLabels[id]||id)+' 지원 조건 확인 필요');}
 return reasons;
}
export function priceLabel(p?:OfferPrice|null){return !p||p.amount==null?'가격 미확인':p.amount===0?'표시 요금 무료':`${p.currency} ${p.amount.toLocaleString('en-US')} / ${p.period==='month'?'월':p.period} · ${p.tax==='included'?'세금 포함':p.tax==='excluded'?'세금 별도':'세금 미확인'}`;}
export const materialChanges=(a:Record<string,unknown>,b:Record<string,unknown>)=>Object.keys(b).filter(k=>canonical(a[k])!==canonical(b[k]));

export function emailDeadline(p:Promotion){if(p.deadlineType==='ongoing'){if(p.expiresAt||p.expiresInstant)return '0000';const checked=reviewStart(p);return Number.isFinite(checked)?new Date(checked+reviewDays*86400000).toISOString():'0000';}if(p.deadlineType==='unknown'||!p.expiresAt)return '0000';const instant=p.expiresInstant||(/T/.test(p.expiresAt)?p.expiresAt:null);if(instant&&/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(instant)&&Number.isFinite(Date.parse(instant)))return new Date(instant).toISOString();if(/^\d{4}-\d{2}-\d{2}$/.test(p.expiresAt)&&Number.isFinite(Date.parse(p.expiresAt)))return new Date(Date.parse(p.expiresAt+'T00:00:00Z')-14*3600000).toISOString();return '0000';}
