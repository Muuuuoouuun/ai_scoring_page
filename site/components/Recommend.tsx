'use client';
import {useState,useEffect} from 'react';
import {searchCatalog,interpretCatalogQuery} from '@/lib/catalog';
import {ToolCard} from './ToolUI';
import {useApp,api} from './Provider';
import {ArrowUpRight} from './Icons';
import SearchMeaning from './SearchMeaning';
import SimilarRecommendations from './SimilarRecommendations';

function TaskRecommendations(){
 const {user}=useApp();
 const [task,setTask]=useState('보고서 작성'),[onlyMine,setOnlyMine]=useState(false),[free,setFree]=useState(false),[ko,setKo]=useState(false);
 const [owned,setOwned]=useState<{owner:NonNullable<typeof user>;ids:string[]}|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{
  let current=true;setOwned(null);setError('');setLoading(!!user);
  if(user)api<{records:{kind:string;payload:{toolId?:string;status?:string}}[]}>('/api/workspace').then(d=>{if(current)setOwned({owner:user,ids:d.records.filter(r=>r.kind==='library'&&r.payload.status!=='stopped').map(r=>r.payload.toolId||'')});}).catch(e=>{if(current)setError(e.message);}).finally(()=>{if(current)setLoading(false);});
  return()=>{current=false;};
 },[user,retry]);
 const waiting=onlyMine&&!!user&&(loading||!error&&owned?.owner!==user),blocked=onlyMine&&(!user||!!error);
 const results=waiting||blocked?[]:searchCatalog(task,{free,korean:ko,...onlyMine?{owned:owned&&owned.owner===user?owned.ids:[]}:{}}).slice(0,6);
 const requestedFree=free||interpretCatalogQuery(task).free;
 return <>
  <div className="panel">
   <label className="field">어떤 일을 하려고 하나요?<input value={task} maxLength={200} onChange={e=>setTask(e.target.value)} placeholder="예: 코딩 도구는 제외하고 개인 업무 정리"/></label>
   <div className="actions">
    <label className="check-label"><input type="checkbox" checked={free} onChange={e=>setFree(e.target.checked)}/>무료 플랜 필요</label>
    <label className="check-label"><input type="checkbox" checked={ko} onChange={e=>setKo(e.target.checked)}/>한국어 지원 확인</label>
    <label className="check-label"><input type="checkbox" checked={onlyMine} disabled={!user} onChange={e=>setOnlyMine(e.target.checked)}/>내 도구함에서 찾기{!user&&' (로그인 필요)'}</label>
   </div>
   <SearchMeaning query={task}/>
   {error&&<p className="error" role="alert">내 도구함을 불러오지 못했습니다. <button className="button ghost small" onClick={()=>setRetry(n=>n+1)}>다시 불러오기</button></p>}
  </div>
  <div className="section-heading section"><h2>업무와 관련된 선택지</h2><span className="metadata" role="status">{waiting?'내 도구함 확인 중':blocked?'검색 범위 확인 필요':results.length+'개 · 기능·업무 관련도 기준'}</span></div>
  {waiting?<p className="loading" role="status">내 도구함의 사용 중인 도구를 확인하고 있습니다.</p>:blocked?<p className="note">{!user?'내 도구함 검색에는 로그인이 필요합니다.':'다시 불러오거나 내 도구함 조건을 해제해 전체 도구를 살펴보세요.'}</p>:results.length?<div className="grid-2">{results.map(t=><div key={t.id} className="recommendation-result">
   <ToolCard tool={t}/>
   <div className="recommendation-evidence">
    {t.unverifiedRequirements.length>0&&<p className="note warning"><strong>요구 조건 확인 필요</strong><br/>{t.unverifiedRequirements.join(' · ')}. 이 서비스의 등록 근거만으로는 충족 여부를 확인하지 못했습니다.</p>}
    {t.matchedUseCases.length>0&&<p>연결된 업무: {t.matchedUseCases.join(' · ')}</p>}
    {requestedFree&&<p className="note">무료 플랜이 있는 서비스입니다. 각 기능의 이용 조건은 아래 근거를 확인하세요.</p>}
    {t.matchedFeatures.length>0?<ul>{t.matchedFeatures.map(f=><li key={f.name}>
     <strong>{f.name}</strong><span className={'badge '+(f.status==='supported'?'green':'yellow')}>{f.status==='supported'?'지원':f.status==='conditional'?'조건부 지원':'확인 필요'}</span>
     <p>{f.description}</p><p className="feature-condition">{f.condition||'추가 이용 조건은 공식 문서를 확인하세요.'}</p>
     <a className="text-link" href={f.sourceUrl} target="_blank" rel="noreferrer">공식 근거<ArrowUpRight size={12}/></a>
    </li>)}</ul>:<p>도구 설명·업무 용례와 연결된 결과입니다. 필요한 세부 기능은 상세 정보에서 확인하세요.</p>}
   </div>
  </div>)}</div>:<div className="empty"><h3>연결할 수 있는 선택지가 없습니다.</h3><p>등록된 기능·업무 용례와 입력 조건에서 결과를 찾지 못했습니다. 필요한 기능을 더 구체적으로 쓰거나 직접 조건을 조정해보세요.</p></div>}
  <p className="note" style={{marginTop:24}}>입력한 업무와 등록된 공식 기능의 관련성을 보여줍니다. 모든 요구 조건의 충족이나 실제 품질을 보장하는 순위는 아닙니다. 기능의 플랜·한도·이용 환경을 확인한 뒤 비교하세요.</p>
 </>;
}

export default function Recommend({initialSource=''}:{initialSource?:string}){
 const [mode,setMode]=useState<'task'|'similar'>(initialSource?'similar':'task'),[source,setSource]=useState(initialSource);
 function selectMode(value:'task'|'similar'){setMode(value);history.replaceState(null,'',value==='similar'&&source?'/recommend?similar='+encodeURIComponent(source):'/recommend');}
 return <><div className="recommend-modes" role="group" aria-label="추천 방식"><button className={'button '+(mode==='task'?'primary':'ghost')} aria-pressed={mode==='task'} onClick={()=>selectMode('task')}>업무로 찾기</button><button className={'button '+(mode==='similar'?'primary':'ghost')} aria-pressed={mode==='similar'} onClick={()=>selectMode('similar')}>비슷한 기능 찾기</button></div>{mode==='task'?<TaskRecommendations/>:<SimilarRecommendations toolId={source} onChange={id=>{setSource(id);history.replaceState(null,'','/recommend'+(id?'?similar='+encodeURIComponent(id):''));}}/>}</>;
}
