'use client';
import {useState} from 'react';
import {documentedCapabilities} from '@/lib/tool-similarity';
import {catalog,findTool,similarTools} from '@/lib/catalog';
import {ToolCard,ToolLogo} from './ToolUI';
import {ArrowUpRight} from './Icons';
import {getToolPricing,matchesPriceFilter,comparableMonthlyPrice,formatUsd,type BillingPeriod,type PriceFilter} from '@/lib/tool-pricing';
import {PriceComparison,ToolPriceSummary} from './ToolPricing';

export default function SimilarRecommendations({toolId,onChange}:{toolId:string;onChange:(id:string)=>void}){
 const [required,setRequired]=useState<{source:string;capability:string}>({source:'',capability:''});
 const [priceFilter,setPriceFilter]=useState<PriceFilter>('all'),[period,setPeriod]=useState<BillingPeriod>('monthly');
 const source=findTool(toolId),capability=required.source===toolId?required.capability:'',allResults=source?similarTools(source,catalog):[],filteredResults=allResults.filter(r=>(!capability||r.matches.some(m=>m.id===capability))&&matchesPriceFilter(getToolPricing(toolId),getToolPricing(r.tool.id),priceFilter,period)),results=filteredResults.slice(0,6);
 const sourcePricing=getToolPricing(toolId),sourceAmount=comparableMonthlyPrice(sourcePricing,period);
 return <>
  <div className="panel">
   <label className="field">기준 서비스<select aria-label="기준 서비스" value={toolId} onChange={e=>onChange(e.target.value)}><option value="">서비스를 선택하세요</option>{catalog.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
   {source&&<div className="similar-source"><ToolLogo tool={source} size={40}/><div><strong>{source.name}</strong><p>{source.summary}</p></div></div>}
   {source&&<label className="field">꼭 필요한 공통 기능<select aria-label="꼭 필요한 공통 기능" value={capability} onChange={e=>setRequired({source:toolId,capability:e.target.value})}><option value="">전체 공통 기능</option>{documentedCapabilities(source).map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label>}
   {source&&<><div className="similar-price-controls"><label className="field">가격 조건<select aria-label="가격 조건" value={priceFilter} onChange={e=>setPriceFilter(e.target.value as PriceFilter)}><option value="all">모든 가격</option><option value="free">무료 플랜이 있는 서비스</option><option value="lower-or-equal">기준 이하의 유료 기본료</option></select></label><label className="field">요금 비교 기준<select aria-label="요금 비교 기준" value={period} onChange={e=>setPeriod(e.target.value as BillingPeriod)}><option value="monthly">매월 결제</option><option value="annual">연간 결제 · 월 환산</option></select></label></div><details className="similar-source-price"><summary>기준 요금 · {sourcePricing?.paid.plan||'비교 요금 미확인'}{sourceAmount!==null?` ${formatUsd(sourceAmount)}/인·월`:null} <span className="metadata">{period==='annual'?'연간 결제 월 환산':'매월 결제'} · 이용 조건·출처 펼치기</span></summary><ToolPriceSummary toolId={source.id} period={period}/></details><p className="metadata">같은 결제 주기의 인당 USD 기본 구독료만 비교합니다. 미확인·문의형·종량제는 금액 비교에서 제외하며, 무료 플랜이 있어도 아래 공통 기능까지 무료라는 뜻은 아닙니다.</p></>}
   <p className="metadata">공식 기능의 겹치는 비율·희소성·지원 조건을 반영합니다. 모델은 모델끼리 비교하며, 같은 장르라는 이유만으로 추천하지 않습니다.</p>
   <details className="similar-method"><summary>추천 순서는 어떻게 정하나요?</summary><p>드문 공통 기능에 더 큰 비중을 두고, 기준 도구의 기능을 얼마나 포함하는지와 전체 기능 범위가 얼마나 비슷한지를 계산합니다. 조건부 기능에는 낮은 가중치를 적용합니다. 이 순서는 성능 평점이나 대체 가능성을 보장하지 않습니다.</p></details>
  </div>
  {source?<><div className="section-heading section"><h2>{source.name} 기준 추천</h2><span className="metadata" role="status">{results.length}개{filteredResults.length>6?` / 총 ${filteredResults.length}개`:""}</span></div>
   {results.length?<div className="grid-2">{results.map(result=><div className="recommendation-result" key={result.tool.id}>
    <ToolCard tool={result.tool}/>
    <PriceComparison sourceId={source.id} candidateId={result.tool.id} period={period}/>
    <div className="recommendation-evidence"><h3>기준 기능 {result.sourceCapabilityCount}개 중 {result.matches.length}개 연결</h3><p className="metadata">{result.conditionalMatchCount?`연결된 기능 중 ${result.conditionalMatchCount}개는 조건부 지원`:'연결된 기능의 지원 근거 있음'}</p>
     <ul>{result.matches.slice(0,3).map(match=><li key={match.id}><strong>{match.label}</strong>
      <p className="metadata">기준: {match.sourceFeatures.map(f=>f.name).join(' · ')}</p>
      {match.candidateFeatures.map(f=><div key={f.name}><p>{f.name} <span className={'badge '+(f.status==='conditional'?'yellow':'green')}>{f.status==='conditional'?'조건부':'지원'}</span></p><p className="feature-condition">{f.condition||f.description}</p><a href={f.sourceUrl} target="_blank" rel="noreferrer" className="text-link">{result.tool.name} 공식 근거<ArrowUpRight size={12}/></a></div>)}
     </li>)}</ul>
     {result.matches.length>3&&<p className="metadata">외 {result.matches.length-3}개 공통 기능</p>}
     {result.missingCapabilities.length>0&&<p className="similar-gap"><strong>추가 확인할 기능</strong> {result.missingCapabilities.map(c=>c.label).join(' · ')}<br/><span className="metadata">현재 등록된 근거에서 연결되지 않았습니다.</span></p>}
     <a className="text-link" href={'/compare?ids='+source.id+','+result.tool.id}>두 서비스 비교<ArrowUpRight size={14}/></a>
    </div>
   </div>)}</div>:<div className="empty"><h3>현재 조건에 맞는 대안이 없습니다.</h3><p>공통 기능 또는 가격 조건을 넓혀 보세요. 요금이 미확인인 서비스와 일회성 체험은 각각 저가·무료 필터에서 제외합니다.</p></div>}
  </>:<div className="empty"><h3>비교할 기준 서비스를 선택하세요.</h3><p>사용 중인 서비스와 기능이 겹치는 선택지를 확인할 수 있습니다.</p></div>}
 </>;
}
