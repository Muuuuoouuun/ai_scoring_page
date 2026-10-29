import type {ReactNode} from 'react';
import SaveContent from '@/components/SaveContent';
import Link from '@/components/Link';
import {catalog,type Tool} from '@/lib/catalog';
import {ToolLogo,SaveTool} from '@/components/ToolUI';
import {ToolPriceSummary} from '@/components/ToolPricing';
import {ArrowRight,ArrowUpRight} from '@/components/Icons';

const criteria:{label:string;content:(tool:Tool)=>ReactNode}[]=[
  {label:'적합한 업무',content:t=>t.useCases.join(' · ')},
  {label:'요금·결제 조건',content:t=><><p style={{marginBottom:12}}>{t.pricing}</p><ToolPriceSummary toolId={t.id}/></>},
  {label:'이용 환경',content:t=>t.platforms.join(' · ')},
  {label:'한국어',content:t=>t.korean},
  {label:'주요 기능',content:t=><div className="stack">{t.features.map(f=><div key={f.name}><strong>{f.name}</strong><p>{f.status==='supported'?'지원':f.status==='conditional'?'조건부 지원':'확인 필요'}{f.condition?' · '+f.condition:''}</p><a href={f.sourceUrl} target="_blank" rel="noreferrer" className="text-link" aria-label={t.name+' '+f.name+' 공식 근거'}>공식 근거<ArrowUpRight size={14}/></a></div>)}</div>},
  {label:'선택 시 유의',content:t=><ul className="bullets compare-limitations">{t.limitations.map(l=><li key={l}>{l}</li>)}</ul>},
  {label:'검수 평가',content:t=><>미평가<p>동일 과제의 검증된 실험이 없습니다.</p><Link className="text-link" href={'/tools/'+t.id+'#reviews'}>사용자 평가 보기<ArrowRight size={14}/></Link></>},
  {label:'확인일',content:t=><time dateTime={t.checkedAt}>{t.checkedAt}</time>},
];

export default async function Page({searchParams}:{searchParams:Promise<{ids?:string}>}){
  const {ids=''}=await searchParams;
  const tools=[...new Set(ids.split(','))].slice(0,3).map(id=>catalog.find(t=>t.id===id)).filter((t):t is Tool=>Boolean(t));
  return <main className="container page compare-page" id="main">
    <div className="page-title"><div><span className="eyebrow">Side by side</span><h1>도구 비교</h1><p>필요한 기능과 조건을 같은 기준으로 확인하세요.</p></div><Link className="button secondary" href="/explore">비교할 도구 선택<ArrowRight size={16}/></Link></div>
    {tools.length<2?<div className="empty"><h2>도구를 2개 이상 선택해주세요.</h2><p>{tools.length===1?`${tools[0].name}와 비교할 도구를 하나 더 담아주세요.`:'탐색 화면에서 비교 버튼을 누르면 최대 3개까지 함께 볼 수 있습니다.'}</p><Link className="button primary" href="/explore">도구 탐색<ArrowRight size={16}/></Link></div>:<>
      <div className="comparison-overview"><div className="comparison-names">{tools.map(t=><Link key={t.id} href={'/tools/'+t.id}><ToolLogo tool={t} size={32}/>{t.name}</Link>)}</div><SaveContent type="comparison" target={tools.map(t=>t.id).sort().join(',')} title={tools.map(t=>t.name).join(' · ')+' 비교'}/></div>
      <div className="compare-scroll compare-desktop" role="region" aria-label="도구별 기능·조건 비교 표" tabIndex={0}>
        <table className="data-table compare-table"><caption className="sr-only">선택한 도구의 기능과 이용 조건 비교</caption><thead><tr><th scope="col">비교 기준</th>{tools.map(t=><th scope="col" key={t.id}><ToolLogo tool={t} size={49}/><h2><Link href={'/tools/'+t.id}>{t.name}</Link></h2><p>{t.vendor}</p></th>)}</tr></thead><tbody>
          {criteria.map(row=><tr key={row.label}><th scope="row">{row.label}</th>{tools.map(t=><td key={t.id}>{row.content(t)}</td>)}</tr>)}
        </tbody></table>
      </div>
      <div className="compare-mobile">{criteria.map(row=><section className="compare-criterion" key={row.label}><h2>{row.label}</h2><dl>{tools.map(t=><div key={t.id}><dt><ToolLogo tool={t} size={26}/><Link href={'/tools/'+t.id}>{t.name}</Link></dt><dd>{row.content(t)}</dd></div>)}</dl></section>)}</div><section className="compare-criterion"><h2>내 도구함에 저장</h2><div className="compare-save-list">{tools.map(t=><div key={t.id}><span>{t.name}</span><SaveTool tool={t}/></div>)}</div></section>
      <p className="note" style={{marginTop:24}}>목록에 없는 기능은 ‘미지원’을 의미하지 않습니다. 선택 전 각 도구의 공식 기능·요금 문서를 확인하세요. 통화와 과금 단위가 다른 요금을 단순 비교하지 않습니다.</p><Link className="text-link" style={{marginTop:20}} href="/recommend">업무 기준으로 다시 찾기<ArrowRight size={16}/></Link>
    </>}
  </main>;
}
