'use client';
import {useState,useCallback,useEffect,useRef} from 'react';
import {searchCatalog,categories,kindLabels} from '@/lib/catalog';
import {genreLabels} from '@/lib/tool-genres';
import {emptyExploreFilters,exploreQuery,readExploreFilters,type ExploreFilters} from '@/lib/explore-filters';
import {ToolCard} from './ToolUI';
import {useToolSearchMCP} from './useToolSearchMCP';
import Link from '@/components/Link';
import {Search,ArrowRight,X,SlidersHorizontal,RefreshCw} from './Icons';
import SearchMeaning from './SearchMeaning';

export default function Explore({initialFilters=emptyExploreFilters}:{initialFilters?:ExploreFilters}){
  const [filters,setFilters]=useState(initialFilters);
  const searchRef=useRef<HTMLInputElement>(null);
  const {q,category,genre,kind,free,korean}=filters;
  const update=useCallback((next:ExploreFilters)=>{
    setFilters(next);
    const query=exploreQuery(next);
    history.replaceState(history.state,'',window.location.pathname+(query?'?'+query:''));
  },[]);
  useEffect(()=>{
    const restore=()=>setFilters(readExploreFilters(new URLSearchParams(window.location.search)));
    window.addEventListener('popstate',restore);
    return()=>window.removeEventListener('popstate',restore);
  },[]);
  useToolSearchMCP(update);
  const results=searchCatalog(q,{category,genre,kind,free,korean});
  const active=[
    ...(genre!=='all'?[{key:'genre',label:genreLabels[genre],value:'all'}]:[]),
    ...(category!=='all'?[{key:'category',label:categories[category],value:'all'}]:[]),
    ...(kind!=='all'?[{key:'kind',label:kindLabels[kind],value:'all'}]:[]),
    ...(free?[{key:'free',label:'무료 플랜 있음',value:false}]:[]),
    ...(korean?[{key:'korean',label:'한국어 지원 확인',value:false}]:[]),
  ];
  const reset=()=>{update(emptyExploreFilters);searchRef.current?.focus();};
  return <>
    <div className="page-title"><div><span className="eyebrow">Explore tools</span><h1>도구 탐색</h1><p>장르와 기능으로 찾고, 최대 3개 도구를 비교하세요.</p></div><div className="actions"><Link className="text-link" href="/recommend">업무별 추천<ArrowRight size={16}/></Link><Link className="text-link" href="/ranking">참여 랭킹<ArrowRight size={16}/></Link></div></div>
    <section className="explore-controls" aria-label="도구 검색과 필터">
      <div className="search-bar" role="search"><Search size={21} aria-hidden="true"/><input ref={searchRef} value={q} onChange={e=>update({...filters,q:e.target.value})} aria-label="도구 이름 또는 목적 검색" placeholder="예: 보고서 작성, Cursor, 자동화" maxLength={160}/>{q&&<button className="icon-button" aria-label="검색어 지우기" onClick={()=>{update({...filters,q:''});searchRef.current?.focus();}}><X size={18}/></button>}</div>
      <div className="explore-filter-heading"><span><SlidersHorizontal size={16} aria-hidden="true"/>필요한 조건으로 좁혀보세요</span>{(q||active.length>0)&&<button className="text-link reset-filters" onClick={reset}><RefreshCw size={14}/>전체 초기화</button>}</div>
      <div className="filters explore-filters">
        <label className="filter-field"><span>장르·업무 분야</span><select aria-label="장르·업무 분야" value={genre} onChange={e=>update({...filters,genre:e.target.value,category:'all'})}>{Object.entries(genreLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
        <label className="filter-field"><span>도구 유형</span><select aria-label="도구 유형" value={kind} onChange={e=>update({...filters,kind:e.target.value})}><option value="all">모든 유형</option>{Object.entries(kindLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
        <div className="filter-toggles"><label className={'check-label'+(free?' checked':'')}><input type="checkbox" checked={free} onChange={e=>update({...filters,free:e.target.checked})}/>무료 플랜 있음</label><label className={'check-label'+(korean?' checked':'')}><input type="checkbox" checked={korean} onChange={e=>update({...filters,korean:e.target.checked})}/>한국어 지원 확인</label></div>
      </div>
      {active.length>0&&<div className="active-filters" aria-label="적용한 조건">{active.map(f=><button key={f.key} className="active-filter" aria-label={f.label+' 조건 해제'} onClick={()=>update({...filters,[f.key]:f.value})}>{f.label}<X size={14}/></button>)}</div>}
    </section>
    <p className="metadata genre-explainer">하나의 도구가 여러 장르에 속할 수 있습니다. 공식 기능에서 확인한 용도를 함께 분류합니다.</p>
    <SearchMeaning query={q}/>
    <div className="results-meta explore-results"><span role="status" aria-live="polite"><strong>{results.length}</strong>개 도구{q&&' · “'+q+'”'}</span><span>{q?'입력한 목적과의 관련도순':'이름순'} · 평점순 아님</span></div>
    {results.length?<div className="grid-3">{results.map(t=><ToolCard key={t.id} tool={t}/>)}</div>:<div className="empty explore-empty"><Search size={28} aria-hidden="true"/><h2>조건에 맞는 도구가 없습니다.</h2><p>검색어를 짧게 바꾸거나 적용한 조건을 하나씩 해제해보세요.</p><button className="button secondary" onClick={reset}>조건 초기화<ArrowRight size={16}/></button><p className="metadata">확인되지 않은 기능은 지원으로 간주하지 않습니다.</p></div>}
  </>;
}
