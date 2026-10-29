import Link from '@/components/Link';
import {notFound} from 'next/navigation';
import {findTool,similarTools,catalog,kindLabels,categories} from '@/lib/catalog';
import {toolGenres,genreLabels} from '@/lib/tool-genres';
import {guides,dateLabel} from '@/lib/content';
import {ToolLogo,ToolCard,SaveTool,CompareButton} from '@/components/ToolUI';
import {ArrowRight,ArrowUpRight} from '@/components/Icons';
import UpdateMeta from '@/components/UpdateMeta';
import ToolReviews from '@/components/ToolReviews';
import ToolFeatures from '@/components/ToolFeatures';
import {ToolPriceSummary} from '@/components/ToolPricing';
import ToolEditorial from '@/components/ToolEditorial';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params,t=findTool(id);return {title:t?t.name+' 기능·평가·업데이트':'도구를 찾을 수 없습니다',description:t?.summary};}
export default async function Page({params}:{params:Promise<{id:string}>}){
 const {id}=await params,t=findTool(id);if(!t)notFound();
 const relevant=guides.filter(g=>g.toolIds.includes(t.id)),related=similarTools(t,catalog).slice(0,2);
 return <main id="main" className="container page">
  <div className="breadcrumb"><Link href="/explore">도구 탐색</Link><span>/</span><span>{categories[t.category]}</span><span>/</span><span>{t.name}</span></div>
  <div className="detail-top"><ToolLogo tool={t} size={80}/><div><span className="badge">{kindLabels[t.kind]}</span><h1>{t.name}</h1><p>{t.summary}</p></div><div className="actions"><a className="button primary" href={t.homepage} target="_blank" rel="noreferrer">공식 사이트<ArrowUpRight size={16}/></a><SaveTool tool={t}/><CompareButton tool={t}/></div></div>
  <nav className="tool-genres" aria-label="이 도구의 장르">{toolGenres(t).map(id=><Link key={id} href={'/explore?genre='+id}>{genreLabels[id]}</Link>)}</nav>
  <nav className="detail-tabs" aria-label="상세 항목"><a href="#overview">개요</a><a href="#reviews">평가·후기</a><a href="#pricing">가격·조건</a><a href="#features">주요 기능</a><a href="#official">블로그·공지</a><a href="#related">유사 도구</a></nav>
  <div className="detail-body"><div>
   <section id="overview"><h2>어떤 도구인가요?</h2><p className="body-copy">{t.description}</p><div className="quick-links">{t.useCases.map(u=><Link key={u} href={'/search?q='+encodeURIComponent(u)}>{u}</Link>)}</div></section>
   <section className="section" id="reviews" aria-labelledby="reviews-title"><ToolReviews tool={t}/></section>
   <section className="section" id="pricing"><h2>가격과 이용 조건</h2><ToolPriceSummary toolId={t.id}/><p className="metadata" style={{marginTop:12}}>대표 플랜의 USD 기본료입니다. 지역·세금·추가 사용량·좌석 조건에 따라 결제액이 달라집니다.</p></section><section className="section" id="features"><h2>주요 기능과 조건</h2><ToolFeatures features={t.features}/><span className="metadata" style={{marginTop:10}}>항목별 확인일은 공식 근거 아래에 표시합니다. 기능과 한도는 플랜에 따라 달라질 수 있습니다.</span></section>
   <section className="section" id="official"><div className="section-heading"><h2>블로그·공지</h2><Link className="text-link" href={'/news/'+t.id}>소식 모아보기<ArrowRight size={15}/></Link></div><ToolEditorial tool={t}/></section>
   <section className="section"><h2>선택 전에 확인하세요</h2><ul className="bullets">{t.limitations.map(l=><li key={l}>{l}</li>)}</ul></section>
   {relevant.length>0&&<section className="section"><h2>이 도구로 시작하기</h2>{relevant.map(g=><Link className="guide-row" key={g.id} href={'/guides/'+g.id}><div><h3>{g.title}</h3><p>{g.summary}</p></div><ArrowRight size={18}/></Link>)}</section>}
  </div><aside className="aside-card"><h3>서비스 정보</h3><ul className="info-list"><li><span>제공사</span><strong>{t.vendor}</strong></li><li><span>이용 환경</span><strong>{t.platforms.join(' · ')}</strong></li><li><span>한국어</span><strong>{t.korean}</strong></li><li><span>요금</span><strong>{t.pricing}</strong></li></ul><span className="metadata">기본 정보 확인 {dateLabel(t.checkedAt)}</span>
   <div className="line-section"><span className="eyebrow">확인한 공식 소식</span><h3 style={{margin:'12px 0 8px'}}>{t.latestUpdate.title}</h3><p style={{fontSize:14}}>{t.latestUpdate.summary}</p><UpdateMeta update={t.latestUpdate} checkedAt={t.checkedAt}/><a className="text-link" href="#official">업데이트 이력 보기<ArrowRight size={14}/></a></div>
   <div className="line-section"><p style={{fontSize:13}}>공식 출처를 바탕으로 정리했습니다. 사용자 제보는 검수 전 공식 기능으로 반영되지 않습니다.</p><Link className="text-link" href={'/community?write=feature&tool='+t.id}>기능 정보 제안<ArrowRight size={14}/></Link></div>
  </aside></div>
  <section className="line-section" id="related"><div className="section-heading"><div><h2>함께 비교할 도구</h2><p>공통 기능의 범위와 지원 조건을 반영했습니다.</p></div><Link className="text-link" href={'/recommend?similar='+t.id}>추천 근거 자세히<ArrowRight size={15}/></Link></div>{related.length?<div className="grid-2">{related.map(r=><div key={r.tool.id}><ToolCard tool={r.tool}/><p className="related-reason">공통 기능 {r.matches.length}개 · {r.matches.slice(0,2).map(m=>m.label).join(' · ')}</p></div>)}</div>:<p className="note">아직 공통 기능의 근거가 충분한 도구가 없습니다.</p>}</section>
 </main>;
}
