import Link from '@/components/Link';
import {notFound} from 'next/navigation';
import {findTool,relatedTools,kindLabels,categories} from '@/lib/catalog';
import {guides,dateLabel} from '@/lib/content';
import {ToolLogo,ToolCard,SaveTool,CompareButton} from '@/components/ToolUI';
import {ArrowRight,ArrowUpRight} from '@/components/Icons';
import ToolReviews from '@/components/ToolReviews';
import ServiceBrief from '@/components/ServiceBrief';
import '@/app/service-brief.css';

export async function generateMetadata({params}:{params:Promise<{id:string}>}){
  const {id}=await params,tool=findTool(id);
  return {title:tool?tool.name+' 기능·평가':'도구를 찾을 수 없습니다',description:tool?.summary};
}

export default async function Page({params}:{params:Promise<{id:string}>}){
  const {id}=await params,tool=findTool(id);
  if(!tool)notFound();
  const relevant=guides.filter(guide=>guide.toolIds.includes(tool.id));
  const related=relatedTools(tool);

  return <main id="main" className="container page service-detail">
    <div className="breadcrumb"><Link href="/explore">도구 탐색</Link><span>/</span><span>{categories[tool.category]}</span><span>/</span><span>{tool.name}</span></div>
    <div className="detail-top">
      <ToolLogo tool={tool} size={80}/>
      <div><span className="metadata">{kindLabels[tool.kind]} · {tool.vendor}</span><h1>{tool.name}</h1><p>{tool.summary}</p></div>
      <div className="actions"><a className="button primary" href={tool.homepage} target="_blank" rel="noreferrer">공식 사이트<ArrowUpRight size={16}/></a><SaveTool tool={tool}/><CompareButton tool={tool}/></div>
    </div>
    <nav className="detail-tabs" aria-label="상세 항목"><a href="#ratings">티어·점수</a><a href="#overview">기능 개괄</a><a href="#reviews">유저평</a><a href="#related">유사 도구</a></nav>
    <ToolReviews tool={tool}>
    <div className="detail-body">
      <div>
        <section id="overview" aria-labelledby="overview-title">
          <span className="eyebrow">공식 기능 안내</span><div className="section-heading"><h2 id="overview-title">기능 개괄</h2><a className="text-link" href="#features">전체 {tool.features.length}개 기능<ArrowRight size={14}/></a></div><p className="body-copy">{tool.description}</p>
          <div className="service-feature-overview">{tool.features.slice(0,3).map((feature,index)=><article key={feature.name}><div className="feature-preview-top"><span className="feature-preview-index">{String(index+1).padStart(2,'0')}</span><span className={'badge '+(feature.status==='supported'?'green':feature.status==='conditional'?'yellow':'gray')}>{feature.status==='supported'?'지원':feature.status==='conditional'?'조건부':'확인 필요'}</span></div><h3>{feature.name}</h3><p>{feature.description}</p>{feature.condition&&<p className="feature-preview-condition">{feature.condition}</p>}<a className="text-link" href="#features" aria-label={feature.name+' 이용 조건과 출처 보기'}>이용 조건·출처<ArrowRight size={14}/></a></article>)}</div>
          <ServiceBrief tool={tool}/>
        </section>
        <section className="section" id="feature-details" aria-labelledby="features-title">
          <h2 id="features-title" className="sr-only">기능별 이용 조건과 공식 근거</h2>
          <details className="service-feature-details"><summary>전체 {tool.features.length}개 기능·이용 조건·공식 근거</summary>
          <table className="feature-table" id="features" role="table">
            <caption className="sr-only">{tool.name}의 공식 기능과 이용 조건</caption>
            <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">기능</th><th scope="col" role="columnheader">지원 범위</th><th scope="col" role="columnheader">이용 조건·출처</th></tr></thead>
            <tbody role="rowgroup">{tool.features.map(feature=><tr role="row" key={feature.name}>
              <td role="cell"><span className="feature-field-label" aria-hidden="true">기능</span><strong>{feature.name}</strong><small>{feature.description}</small></td>
              <td role="cell"><span className="feature-field-label" aria-hidden="true">지원 범위</span><span className={'badge '+(feature.status==='supported'?'green':feature.status==='conditional'?'yellow':'gray')}>{feature.status==='supported'?'지원':feature.status==='conditional'?'조건부 지원':'확인 필요'}</span></td>
              <td role="cell"><span className="feature-field-label" aria-hidden="true">이용 조건·출처</span><p className="feature-condition-copy">{feature.condition||'추가 조건은 공식 문서를 확인하세요.'}</p><a className="text-link feature-source" href={feature.sourceUrl} target="_blank" rel="noreferrer">공식 근거<span className="sr-only"> · {feature.name}</span><ArrowUpRight size={14}/></a></td>
            </tr>)}</tbody>
          </table>
          <p className="feature-check-date">공식 자료 확인 {dateLabel(tool.checkedAt)} · 기능과 한도는 플랜에 따라 달라질 수 있습니다.</p>
          </details>
        </section>
        <section className="section service-limitations"><details><summary>선택 전에 확인할 {tool.limitations.length}가지</summary><ul className="bullets">{tool.limitations.map(limitation=><li key={limitation}>{limitation}</li>)}</ul></details></section>
        {relevant.length>0&&<section className="section"><h2>이 도구로 시작하기</h2>{relevant.map(guide=><Link className="guide-row" key={guide.id} href={'/guides/'+guide.id}><div><h3>{guide.title}</h3><p>{guide.summary}</p></div><ArrowRight size={18}/></Link>)}</section>}
      </div>
      <aside className="aside-card" aria-label="공식 업데이트와 정보 제안">
        <span className="eyebrow">공식 업데이트</span><h3 className="service-update-title">{tool.latestUpdate.title}</h3><p className="service-update-summary">{tool.latestUpdate.summary}</p><span className="metadata" style={{marginTop:10}}>게시 {dateLabel(tool.latestUpdate.publishedAt)}</span><Link className="text-link" href={'/news/'+tool.id}>내용·출처 확인<ArrowRight size={14}/></Link>
        <div className="line-section"><p className="service-source-note">공식 자료를 바탕으로 정리했습니다. 사용자 제보는 검수 전 공식 기능으로 반영되지 않습니다.</p><Link className="text-link" href={'/community?write=feature&tool='+tool.id}>기능 정보 제안<ArrowRight size={14}/></Link></div>
      </aside>
    </div>
    </ToolReviews>
    <section className="line-section" id="related">
      <div className="section-heading"><div><h2>함께 비교할 도구</h2><p>공식 자료에 확인된 공통 기능을 기준으로 골랐습니다.</p></div></div>
      {related.length>0?<div className="grid-2">{related.map(candidate=><div className="related-tool" key={candidate.id}><ToolCard tool={candidate}/><Link className="related-pair-link" href={'/compare?ids='+[tool.id,candidate.id].map(encodeURIComponent).join(',')} aria-label={tool.name+'와 '+candidate.name+' 비교'}>{tool.name}와 비교<ArrowRight size={16}/></Link></div>)}</div>:<p className="note">등록된 공식 기능에서 함께 비교할 도구를 아직 확인하지 못했습니다.</p>}
    </section>
  </main>;
}
