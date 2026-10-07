import type {ReactNode} from 'react';
import Link from './Link';
import SaveContent from './SaveContent';
import {ToolLogo,SaveTool} from './ToolUI';
import {ArrowRight,ArrowUpRight} from './Icons';
import {catalog,categories,kindLabels,type Tool} from '@/lib/catalog';

type Criterion={id:string;label:string;note:string;value:(tool:Tool)=>ReactNode};
const criteria:Criterion[]=[
 {id:'work',label:'활용 업무',note:'등록된 사용 목적',value:tool=>tool.useCases.join(' · ')},
 {id:'pricing',label:'요금 구조',note:'플랜·통화·과금 단위는 공식 문서에서 확인',value:tool=>tool.pricing},
 {id:'platforms',label:'이용 환경',note:'기능별 제공 범위는 아래 상세 조건에서 확인',value:tool=>tool.platforms.join(' · ')},
 {id:'korean',label:'한국어',note:'등록된 지원 정보',value:tool=>tool.korean},
 {id:'source',label:'출처·확인일',note:'서비스별 공식 자료 기준',value:tool=><>
  <time dateTime={tool.checkedAt}>{tool.checkedAt}</time>
  <a className="text-link comparison-source-jump" href={'#comparison-sources-'+tool.id}>{tool.name} 근거 확인<ArrowRight size={13}/></a>
 </>},
];
const statusLabels={supported:'지원',conditional:'조건부 지원',unknown:'확인 필요'};

function ToolEvidence({tool}:{tool:Tool}){
 return <details className="comparison-evidence" id={'comparison-details-'+tool.id}>
  <summary>
   <span className="comparison-evidence-title">{tool.name} 기능·조건·출처</span>
   <span className="comparison-evidence-meta">주요 기능 {tool.features.length}개 · 확인 {tool.checkedAt}</span>
  </summary>
  <div className="comparison-evidence-body">
   <h3>주요 기능과 이용 조건</h3>
   <ul className="comparison-features">
    {tool.features.map(feature=><li key={feature.name}>
     <div className="comparison-feature-heading"><h4>{feature.name}</h4><span className={'badge '+(feature.status==='supported'?'green':feature.status==='conditional'?'yellow':'gray')}>{statusLabels[feature.status]}</span></div>
     <p>{feature.description}</p>
     <p className="comparison-condition">{feature.condition||'추가 이용 조건은 공식 문서에서 확인하세요.'}</p>
     <a href={feature.sourceUrl} target="_blank" rel="noreferrer" className="text-link">{feature.name} 공식 근거<ArrowUpRight size={13}/></a>
    </li>)}
   </ul>
   <h3>선택 전에 확인할 점</h3>
   <ul className="bullets comparison-limitations">{tool.limitations.map(limitation=><li key={limitation}>{limitation}</li>)}</ul>
   <h3 id={'comparison-sources-'+tool.id}>확인에 사용한 공식 자료</h3>
   <p className="comparison-source-date">확인일 <time dateTime={tool.checkedAt}>{tool.checkedAt}</time> · 요금과 제공 범위는 변경될 수 있습니다.</p>
   <ul className="comparison-sources">{tool.sourceUrls.map(url=><li key={url}><a className="text-link" href={url} target="_blank" rel="noreferrer">{url.replace(/^https?:\/\//,'')}<ArrowUpRight size={13}/></a></li>)}</ul>
   <a className="text-link" href={tool.homepage} target="_blank" rel="noreferrer">{tool.name} 공식 사이트<ArrowUpRight size={14}/></a>
  </div>
 </details>;
}

export default function ToolComparison({tools}:{tools:Tool[]}){
 const single=tools.length===1;
 const selected=tools[0];
 // Browsing groups describe catalog classifications, not feature equivalence or quality.
 const sameKind=single?catalog.filter(tool=>tool.id!==selected.id&&tool.kind===selected.kind):[];
 const sameCategory=sameKind.filter(tool=>tool.category===selected.category);
 const neighbors=(sameCategory.length?sameCategory:sameKind).slice(0,3);

 return <>
  <section aria-labelledby="comparison-selected-title" className="comparison-selection">
   <div className="section-heading">
    <h2 id="comparison-selected-title">선택한 도구 <span className="comparison-count">{tools.length}/3</span></h2>
    {!single&&<SaveContent type="comparison" target={tools.map(tool=>tool.id).sort().join(',')} title={tools.map(tool=>tool.name).join(' · ')+' 비교'}/>}
   </div>
   <div className="comparison-selected-tools">
    {tools.map(tool=><article className="comparison-selected-tool" key={tool.id}>
     <div className="comparison-tool-heading"><ToolLogo tool={tool} size={44}/><div><h3><Link href={'/tools/'+tool.id}>{tool.name}</Link></h3><span className="metadata">{kindLabels[tool.kind]} · {tool.vendor}</span></div></div>
     <p>{tool.summary}</p>
     <div className="comparison-tool-actions"><Link className="text-link" href={'/tools/'+tool.id}>서비스 자세히 보기<ArrowRight size={14}/></Link><SaveTool tool={tool}/></div>
    </article>)}
   </div>
   {single&&<p className="comparison-single-note">{selected.name}의 조건을 먼저 확인할 수 있습니다. 다른 도구를 더하면 최대 3개까지 함께 비교합니다.</p>}
  </section>

  <section className="comparison-basics" aria-labelledby="comparison-basics-title">
   <div className="section-heading"><div><h2 id="comparison-basics-title">{single?'선택한 도구의 이용 조건':'공통 기준으로 이용 조건 비교'}</h2><p>요금은 통화·과금 단위가 다를 수 있습니다. 필요한 기능의 플랜과 한도도 함께 확인하세요.</p></div></div>
   <div className="comparison-desktop">
    <table className="comparison-basics-table">
     <caption className="sr-only">선택한 도구의 업무, 요금 구조, 이용 환경, 한국어 및 출처 비교</caption>
     <colgroup><col className="comparison-criterion-column"/>{tools.map(tool=><col key={tool.id}/>)}</colgroup>
     <thead><tr><th scope="col">비교 기준</th>{tools.map(tool=><th scope="col" key={tool.id}><Link href={'/tools/'+tool.id}>{tool.name}</Link></th>)}</tr></thead>
     <tbody>{criteria.map(criterion=><tr key={criterion.id}>
      <th scope="row">{criterion.label}<span className="comparison-criterion-note">{criterion.note}</span></th>
      {tools.map(tool=><td key={tool.id}>{criterion.value(tool)}</td>)}
     </tr>)}</tbody>
    </table>
   </div>
   <div className="comparison-mobile">
    {criteria.map(criterion=><section className="comparison-criterion" key={criterion.id} aria-labelledby={'comparison-criterion-'+criterion.id}>
     <h3 id={'comparison-criterion-'+criterion.id}>{criterion.label}</h3><p className="comparison-criterion-note">{criterion.note}</p>
     <dl>{tools.map(tool=><div key={tool.id}><dt>{tool.name}</dt><dd>{criterion.value(tool)}</dd></div>)}</dl>
    </section>)}
   </div>
  </section>

  {single&&neighbors.length>0&&<section className="comparison-neighbors" aria-labelledby="comparison-neighbors-title">
   <div className="section-heading"><div><h2 id="comparison-neighbors-title">함께 살펴볼 서비스</h2><p>{sameCategory.length?categories[selected.category]+' · '+kindLabels[selected.kind]+' 분류의 서비스입니다.':kindLabels[selected.kind]+' 분류의 다른 서비스입니다.'} 각 기능의 범위와 조건은 비교에서 확인하세요.</p></div></div>
   <div className="comparison-neighbor-list">{neighbors.map(tool=><article key={tool.id}>
    <div><h3>{tool.name}</h3><p>{tool.summary}</p></div>
    <Link className="text-link" href={'/compare?ids='+selected.id+','+tool.id} aria-label={selected.name+' · '+tool.name+' 비교'}>{tool.name} 비교에 추가<ArrowRight size={15}/></Link>
   </article>)}</div>
  </section>}

  <section className="comparison-details-section" aria-labelledby="comparison-details-title">
   <div className="section-heading"><div><h2 id="comparison-details-title">서비스별 기능과 근거</h2><p>각 서비스에 등록된 기능을 그대로 보여줍니다. 기능 이름이 같아도 제공 범위와 조건은 다를 수 있으며, 목록에 없는 기능은 ‘미지원’을 의미하지 않습니다.</p></div></div>
   {tools.map(tool=><ToolEvidence tool={tool} key={tool.id}/>)}
  </section>

  <section className="comparison-experience" aria-labelledby="comparison-experience-title">
   <h2 id="comparison-experience-title">사용 경험은 따로 확인하세요</h2>
   <p>공식 기능 정보와 사용자 경험을 구분합니다. 동일 과제의 검증된 실험이 없어 검수 점수는 아직 미평가입니다.</p>
   <div className="actions">{tools.map(tool=><Link className="text-link" key={tool.id} href={'/tools/'+tool.id+'#reviews'}>{tool.name} 사용자 평가 보기<ArrowRight size={14}/></Link>)}</div>
  </section>
  <Link className="text-link comparison-refind" href="/recommend">업무 기준으로 다시 찾기<ArrowRight size={16}/></Link>
 </>;
}
