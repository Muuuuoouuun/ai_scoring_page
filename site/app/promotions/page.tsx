import raw from '@/data/promotions.json';
import {deadlineState,deadlineLabel,priceLabel,featureLabels,type Promotion} from '@/lib/promotion-facts';
import {findTool} from '@/lib/catalog';
import {ToolLogo} from '@/components/ToolUI';
import {ArrowUpRight} from '@/components/Icons';
export default function Page(){return <main className="container page reading-width" id="main">
 <div className="page-title"><div><h1>혜택·프로모션</h1><p>공식 안내에서 확인한 혜택과 신청 조건을 살펴보세요.</p></div></div>
 <p className="note" style={{marginBottom:24}}>상시 교육 혜택도 포함합니다. 고정 마감이 없는 프로그램은 출처 확인 후 30일이 지나면 재확인이 필요한 항목으로 표시합니다.</p>
 <div className="stack">{(raw as Promotion[]).map(p=>{const deadline=deadlineState(p),closed=p.status!=='active'||deadline==='expired',tool=findTool(p.toolId);return <article className="panel promotion-detail" key={p.id} id={p.id}>
  <div className="section-heading"><span className={'badge '+(closed?'gray':'yellow')}>{p.status==='withdrawn'?'안내 철회':closed?'마감·종료':p.reviewStatus!=='verified'?'조건 검토 중':deadline==='uncertain'?'공식 안내 재확인 필요':'자격 확인 필요'}</span>{tool&&<a className="text-link" href={'/tools/'+tool.id}><ToolLogo tool={tool} size={24}/>{tool.name}</a>}</div>
  <h2 style={{margin:'16px 0 10px'}}>{p.name}</h2><p>{p.summary}</p>
  <div className="grid-2" style={{gap:24,margin:'24px 0'}}><div><span className="metadata">혜택 요금</span><h3 style={{marginTop:8}}>{priceLabel(p.price)}</h3><p>{p.priceNote}</p><p className="metadata">{p.benefitDuration}</p></div><div><span className="metadata">유지·갱신 조건</span><h3 style={{marginTop:8}}>{p.renewalPrice?priceLabel(p.renewalPrice):'고정 갱신가 미확인'}</h3><p>{p.renewalNote||'향후 갱신 금액과 세금은 신청 화면에서 확인하세요.'}</p></div></div>
  <p className="note">{deadlineLabel(p)}<br/>대상: {p.region}{p.eligibilityNote&&<><br/>{p.eligibilityNote}</>}</p>
  <div className="grid-2" style={{gap:28,marginTop:24}}><section><h3>참여 자격</h3><ul className="bullets">{p.eligibility.map(e=><li key={e}>{e}</li>)}</ul></section><section><h3>이용 조건</h3><ul className="bullets">{p.conditions.map(e=><li key={e}>{e}</li>)}</ul></section></div>
  <h3>포함 기능</h3><ul className="bullets">{(p.offerFeatures||[]).map(f=><li key={f.id}><strong>{featureLabels[f.id]||f.id}</strong> · {f.status==='supported'?'지원':f.status==='conditional'?'조건부':f.status==='unsupported'?'미포함':'포함 여부 미확인'}<p>{f.condition} <a href={f.sourceUrl} target="_blank" rel="noreferrer">근거 ↗</a></p></li>)}</ul>
  {p.applicationNote&&<p>{p.applicationNote}</p>}<div className="actions"><a className="button secondary" href={p.url} target="_blank" rel="noreferrer">공식 혜택 안내<ArrowUpRight size={15}/></a><a className="text-link" href="/my?tab=settings">내 혜택 조건 설정</a></div>
  <div className="metadata" style={{marginTop:20}}>공식 출처 확인 {p.checkedAt} · 신청과 최종 자격 확인은 공식 서비스에서 진행합니다.<div className="actions" style={{marginTop:10}}>{p.sourceUrls.map((url,i)=><a key={url} href={url} target="_blank" rel="noreferrer">공식 근거 {i+1} · {new URL(url).hostname} ↗</a>)}</div></div>
 </article>;})}</div></main>;}
