import {comparableMonthlyPrice,comparePricing,formatUsd,getToolPricing,type BillingPeriod} from '@/lib/tool-pricing';
import {ArrowUpRight} from './Icons';
import './pricing.css';

export function ToolPriceSummary({toolId,period='monthly',compact=false}:{toolId:string;period?:BillingPeriod;compact?:boolean}){
 const pricing=getToolPricing(toolId);
 if(!pricing)return <div className="tool-price-summary"><span className="badge">비교 요금 미확인</span><p className="metadata">인당 USD 구독료가 등록되지 않아 가격 비교에서 제외됩니다.</p></div>;
 const amount=comparableMonthlyPrice(pricing,period),other=comparableMonthlyPrice(pricing,period==='monthly'?'annual':'monthly');
 const freeLabel={available:'무료 플랜 있음',unavailable:'무료 플랜 없음',trial:'일회성 무료 체험',unknown:'무료 여부 미확인'}[pricing.freeTier];
 const unavailableLabel=pricing.paid.kind==='usage'?'사용량에 따라 과금':pricing.paid.kind==='quote'?'별도 견적':`${period==='monthly'?'월결제':'연결제'} 요금 미확인`;
 return <div className="tool-price-summary">
  <div className="tool-price-heading"><span className={'badge '+(pricing.freeTier==='available'?'green':'')}>{freeLabel}</span><span className="metadata">대표 유료 플랜</span></div>
  <p className="tool-price-plan">{pricing.paid.plan}</p>
  <p className="tool-price-amount">{amount!==null?<><strong>{formatUsd(amount)}</strong><span>/인·월</span></>:<strong>{unavailableLabel}</strong>}</p>
  <p className="tool-price-term">{amount!==null?(period==='annual'?`연간 결제 · 월 환산${pricing.paid.annualTotal?` · 연 ${formatUsd(pricing.paid.annualTotal)} 결제`:''}`:'매월 결제 · USD 기본 구독료'):'선택한 결제 주기에서는 수치 비교하지 않습니다.'}</p>
  {!compact&&other!==null&&<p className="metadata">{period==='monthly'?'연간 결제 시 월 환산':'매월 결제 시'} {formatUsd(other)}/인</p>}
  <p className="tool-price-condition">{pricing.paid.note}</p>
  {!compact&&<p className="tool-price-free-note">{pricing.freeNote}</p>}
  <div className="tool-price-source"><a href={pricing.sourceUrl} target="_blank" rel="noreferrer" className="text-link">공식 요금<ArrowUpRight size={12}/></a><span>확인 {pricing.checkedAt}</span>{pricing.additionalSources?.map((url,i)=><a key={url} href={url} target="_blank" rel="noreferrer" className="text-link">추가 근거 {i+1}<ArrowUpRight size={12}/></a>)}</div>
 </div>;
}

export function PriceComparison({sourceId,candidateId,period='monthly'}:{sourceId:string;candidateId:string;period?:BillingPeriod}){
 const comparison=comparePricing(getToolPricing(sourceId),getToolPricing(candidateId),period);
 const {relation,difference}=comparison;
 const label=relation==='unavailable'?'가격 수치 비교 불가':relation==='equal'?'기준과 같은 기본료':`기준보다 월 ${formatUsd(difference!)} ${relation==='lower'?'낮음':'높음'}`;
 return <div className="recommendation-price">
  <div className={'price-comparison-label '+(relation==='lower'?'price-lower':relation==='higher'?'price-higher':'')}>{label}</div>
  {relation!=='unavailable'&&<p className="metadata">기준 {formatUsd(comparison.sourceAmount!)} → 추천 {formatUsd(comparison.candidateAmount!)} /인·월 · {period==='annual'?'연간 결제 월 환산':'매월 결제'}</p>}
  <ToolPriceSummary toolId={candidateId} period={period} compact/>
  <p className="tool-price-caveat">대표 플랜의 기본료 비교입니다. 공통 기능의 포함 여부·사용량·세금·추가 요금에 따라 실제 비용은 달라집니다.</p>
 </div>;
}
