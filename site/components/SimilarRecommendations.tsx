'use client';
import {catalog,findTool,similarTools} from '@/lib/catalog';
import {ToolCard,ToolLogo} from './ToolUI';
import {ArrowUpRight} from './Icons';

export default function SimilarRecommendations({toolId,onChange}:{toolId:string;onChange:(id:string)=>void}){
 const source=findTool(toolId),results=source?similarTools(source,catalog).slice(0,6):[];
 return <>
  <div className="panel">
   <label className="field">기준 서비스<select value={toolId} onChange={e=>onChange(e.target.value)}><option value="">서비스를 선택하세요</option>{catalog.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
   {source&&<div className="similar-source"><ToolLogo tool={source} size={40}/><div><strong>{source.name}</strong><p>{source.summary}</p></div></div>}
   <p className="metadata">두 서비스에 공개된 공통 기능을 기준으로 찾습니다. 기능의 범위·플랜·한도는 각각 확인하세요.</p>
  </div>
  {source?<><div className="section-heading section"><h2>{source.name} 기준 추천</h2><span className="metadata" role="status">{results.length}개</span></div>
   {results.length?<div className="grid-2">{results.map(result=><div className="recommendation-result" key={result.tool.id}>
    <ToolCard tool={result.tool}/>
    <div className="recommendation-evidence"><h3>공통 기능 {result.matches.length}개</h3>
     <ul>{result.matches.slice(0,3).map(match=><li key={match.id}><strong>{match.label}</strong>
      <p className="metadata">기준: {match.sourceFeatures.map(f=>f.name).join(' · ')}</p>
      {match.candidateFeatures.map(f=><div key={f.name}><p>{f.name} <span className={'badge '+(f.status==='conditional'?'yellow':'green')}>{f.status==='conditional'?'조건부':'지원'}</span></p><p className="feature-condition">{f.condition||f.description}</p><a href={f.sourceUrl} target="_blank" rel="noreferrer" className="text-link">{result.tool.name} 공식 근거<ArrowUpRight size={12}/></a></div>)}
     </li>)}</ul>
     {result.matches.length>3&&<p className="metadata">외 {result.matches.length-3}개 공통 기능</p>}
     <a className="text-link" href={'/compare?ids='+source.id+','+result.tool.id}>두 서비스 비교<ArrowUpRight size={14}/></a>
    </div>
   </div>)}</div>:<div className="empty"><h3>공통 기능의 근거가 충분하지 않습니다.</h3><p>등록된 기능에서 연결할 대안을 찾지 못했습니다. 다른 서비스를 선택하거나 업무로 찾아보세요.</p></div>}
  </>:<div className="empty"><h3>비교할 기준 서비스를 선택하세요.</h3><p>사용 중인 서비스와 기능이 겹치는 선택지를 확인할 수 있습니다.</p></div>}
 </>;
}
