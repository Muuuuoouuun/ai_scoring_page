import Link from '@/components/Link';
import {ArrowUpRight} from '@/components/Icons';
import {groupedResources,groupLabels,groupNotes,pricingLabels,pricingTone,koreanLabels,resources} from '@/lib/resources';

export const metadata={title:'유용한 사이트',description:'레퍼런스, 무료 에셋, 이미지 도구, 실무 유틸리티를 가격 조건·라이선스 주의점과 함께 정리했습니다.'};

export default function Page(){
 const groups=groupedResources();
 return <main id="main" className="container page">
  <div className="page-title"><div><span className="eyebrow">유용한 사이트</span><h1>실무에서 자주 여는 사이트 {resources.length}곳</h1><p>도구 평가와 달리 점수를 매기지 않습니다. 언제 쓰는지, 무엇을 더 잘하는지, 라이선스와 유료 조건에서 무엇을 조심해야 하는지만 적었습니다.</p></div></div>
  {groups.map(({group,sites})=><section className="section" key={group}>
   <div className="section-heading"><div><h2>{groupLabels[group]} {sites.length}곳</h2><p>{groupNotes[group]}</p></div></div>
   <div className="grid-3">{sites.map(site=><article className="tool-card" key={site.name}>
    <div className="tool-card-top"><div><a className="tool-name" href={site.url} target="_blank" rel="noreferrer">{site.name}<ArrowUpRight size={14}/></a><p style={{fontSize:12,marginTop:4}}>{site.tagline}</p></div></div>
    <div className="actions" style={{marginTop:14}}><span className={'badge '+pricingTone[site.pricing]}>{pricingLabels[site.pricing]}</span><span className="badge gray">{koreanLabels[site.koreanFriendly]}</span></div>
    <p style={{minHeight:0,margin:'16px 0 0'}}>{site.useCase}</p>
    <dl style={{margin:'16px 0 0'}}>
     <dt style={{fontSize:11,marginTop:0}}>이 사이트의 강점</dt><dd style={{fontSize:12}}>{site.strength}</dd>
     <dt style={{fontSize:11}}>주의할 점</dt><dd style={{fontSize:12}}>{site.caution}</dd>
    </dl>
    <p className="note" style={{marginTop:16}}>{site.pricingDetail}</p>
    {site.alternatives.length>0&&<span className="metadata" style={{marginTop:12}}>비슷한 곳 · {site.alternatives.join(', ')}</span>}
   </article>)}</div>
  </section>)}
  <section className="line-section"><p className="metadata">가격과 라이선스는 2026-09 기준으로 확인했습니다. 출처마다 금액이 다른 항목은 본문에 그렇게 적었고, 실제 계약 조건은 각 사이트의 공식 안내를 따릅니다.</p><Link className="text-link" href="/explore">도구 탐색으로 돌아가기<ArrowUpRight size={14}/></Link></section>
 </main>;
}
