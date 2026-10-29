'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowUpRight,ArrowRight,Check,Code2,GitBranch,Layers,Search,ShieldCheck,TrendingUp,X} from 'lucide-react';
import {
  emptyGitHubFilters,filterGitHubEntries,githubCategories,githubCheckedAt,githubEntries,githubQuery,
  githubSections,readGitHubFilters,type GitHubCategory,type GitHubEntry,type GitHubFilters,type GitHubSection,
} from '@/lib/github-content';

const sectionContent={
  trends:{icon:TrendingUp,kicker:'지금 살펴볼 변화',description:'최근 확인한 릴리스를 바탕으로, AI 도구를 쓰는 방식의 변화를 골랐습니다.'},
  steady:{icon:Layers,kicker:'반복해서 쓰는 기반',description:'모델 실행, 자동화, 에이전트 개발에 활용할 기반 프로젝트를 골랐습니다.'},
  issues:{icon:ShieldCheck,kicker:'도입 전에 확인할 점',description:'보안 공지와 호환성·유지보수 변경을 영향 범위, 다음 행동과 함께 확인하세요.'},
};
const issueLabels={security:'보안 공지',migration:'업그레이드',maintenance:'유지보수'};
const dateLabel=(value:string)=>value.replaceAll('-','.');

function SourceLink({source,name}:{source:GitHubEntry['sources'][number];name:string}){
  return <a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${name} · ${source.label} (새 탭)`}>{source.label}<ArrowUpRight size={14} aria-hidden="true"/></a>;
}

function EntryCard({entry}:{entry:GitHubEntry}){
  const issue=entry.section==='issues';
  return <article className={'github-card'+(issue?' github-issue-card':'')} id={entry.id}>
    <div className="github-card-top">
      <span className={'github-kind'+(issue?' github-kind-issue':'')}>{entry.issueType?issueLabels[entry.issueType]:githubCategories[entry.category]}</span>
      {entry.release&&<span className="github-version">{entry.release.version}</span>}
    </div>
    <p className="github-repo"><GitBranch size={14} aria-hidden="true"/>{entry.repo}</p>
    <h3>{entry.name}</h3>
    <p className="github-headline">{entry.headline}</p>
    <p className="github-summary">{entry.summary}</p>
    {entry.scope&&<div className="github-scope"><strong>해당하는 환경</strong><p>{entry.scope}</p></div>}
    <div className="github-tags" aria-label="관련 주제">{entry.tags.map(tag=><span key={tag}>{tag}</span>)}</div>
    <details className="github-details">
      <summary>{issue?'확인 이유와 다음 행동':'선정 이유와 시작 방법'}<ArrowRight size={15} aria-hidden="true"/></summary>
      <p>{entry.reason}</p><p><strong>다음 행동</strong> {entry.nextStep}</p>
    </details>
    <div className="github-card-footer">
      <div className="github-source-links">{entry.sources.map(source=><SourceLink key={source.url} source={source} name={entry.name}/>)}</div>
      <p className="github-dates">{entry.publishedAt?<span>{entry.release?'릴리스':'공지'} <time dateTime={entry.publishedAt}>{dateLabel(entry.publishedAt)}</time></span>:<span>상시 안내 · 발표일 미표기</span>}<span>확인 <time dateTime={entry.checkedAt}>{dateLabel(entry.checkedAt)}</time></span></p>
    </div>
  </article>;
}

export default function GitHubHub({initialFilters=emptyGitHubFilters}:{initialFilters?:GitHubFilters}){
  const [filters,setFilters]=useState(initialFilters);
  const inputRef=useRef<HTMLInputElement>(null);
  const update=useCallback((next:GitHubFilters,push=false)=>{
    setFilters(next);
    const query=githubQuery(next),url=window.location.pathname+(query?'?'+query:'');
    if(push)window.history.pushState(window.history.state,'',url);
    else window.history.replaceState(window.history.state,'',url);
  },[]);
  useEffect(()=>{
    const restore=()=>setFilters(readGitHubFilters(new URLSearchParams(window.location.search)));
    window.addEventListener('popstate',restore);
    return()=>window.removeEventListener('popstate',restore);
  },[]);
  const results=filterGitHubEntries(githubEntries,filters);
  const current=sectionContent[filters.tab],CurrentIcon=current.icon;
  const reset=()=>{update({...filters,q:'',category:'all',sort:'recent'});inputRef.current?.focus();};
  const hasConditions=!!filters.q||filters.category!=='all'||filters.sort!=='recent';

  return <>
    <div className="page-title github-title">
      <div><span className="eyebrow">Open source radar</span><h1>GitHub 동향</h1><p>새로운 흐름부터 오래 쓸 기반 도구까지, 공식 출처로 살펴보세요.</p></div>
      <a className="text-link" href="https://github.com/trending" target="_blank" rel="noopener noreferrer">GitHub Trending 원문<ArrowUpRight size={16} aria-hidden="true"/><span className="github-sr-only"> (새 탭)</span></a>
    </div>

    <section className="github-intro" aria-label="이번 GitHub 동향의 확인 기준">
      <div className="github-intro-copy"><span className="github-intro-icon"><Code2 size={24} aria-hidden="true"/></span><div><h2>무엇이 바뀌었고, 어디에 쓸 수 있을까?</h2><p>코딩 에이전트, MCP 연결, 업무 자동화의 변화를 한국어로 정리했습니다.</p></div></div>
      <div className="github-snapshot"><span><Check size={14} aria-hidden="true"/>공식 출처 확인 스냅샷</span><time dateTime={githubCheckedAt}>{dateLabel(githubCheckedAt)}</time><small>실시간 인기 순위가 아닌 편집 선정</small></div>
    </section>

    <nav className="github-tabs" aria-label="GitHub 콘텐츠 분류">
      {(Object.keys(githubSections) as GitHubSection[]).map(key=>{
        const Icon=sectionContent[key].icon;
        const next={...filters,tab:key},query=githubQuery(next);
        return <a key={key} className={filters.tab===key?'active':''} href={'/github'+(query?'?'+query:'')} aria-current={filters.tab===key?'page':undefined} onClick={event=>{
          if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
          event.preventDefault();update(next,true);
        }}><Icon size={18} aria-hidden="true"/><span>{githubSections[key]}</span><span className="github-tab-count">{githubEntries.filter(entry=>entry.section===key).length}</span></a>;
      })}
    </nav>

    <section className="github-controls" aria-label="GitHub 프로젝트 검색과 필터">
      <div className="search-bar github-search" role="search"><Search size={20} aria-hidden="true"/><input ref={inputRef} value={filters.q} onChange={event=>update({...filters,q:event.target.value})} aria-label="프로젝트 이름이나 주제 검색" placeholder="예: Gemini, 문서 검색, MCP" maxLength={160}/>{filters.q&&<button className="icon-button" aria-label="검색어 지우기" onClick={()=>{update({...filters,q:''});inputRef.current?.focus();}}><X size={18}/></button>}</div>
      <label className="github-filter"><span>분야</span><select value={filters.category} onChange={event=>update({...filters,category:event.target.value as GitHubCategory})}>{Object.entries(githubCategories).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
      <label className="github-filter"><span>정렬</span><select value={filters.sort} onChange={event=>update({...filters,sort:event.target.value as GitHubFilters['sort']})}><option value="recent">최근 발표순</option><option value="curated">편집 순서</option></select></label>
    </section>

    <section className="github-results" aria-labelledby="github-section-title">
      <div className="github-section-heading"><div><span className="github-section-kicker"><CurrentIcon size={15} aria-hidden="true"/>{current.kicker}</span><h2 id="github-section-title">{githubSections[filters.tab]}</h2><p>{current.description}</p></div><div className="github-result-actions"><span role="status" aria-live="polite"><strong>{results.length}</strong>개{filters.q&&<span className="github-result-query"> · “{filters.q}”</span>}</span>{hasConditions&&<button onClick={reset}>필터 초기화</button>}</div></div>
      {results.length?<div className="github-grid">{results.map(entry=><EntryCard key={entry.id} entry={entry}/>)}</div>:<div className="empty github-empty"><Search size={30} aria-hidden="true"/><h3>조건에 맞는 항목이 없습니다.</h3><p>현재 ‘{githubSections[filters.tab]}’ 안에서 찾고 있습니다. 다른 분류를 선택하거나 검색 조건을 줄여보세요.</p><button className="button secondary" onClick={reset}>검색·필터 초기화<ArrowRight size={16}/></button></div>}
    </section>

    <aside className="github-method" aria-label="콘텐츠 선정과 갱신 안내"><div><ShieldCheck size={19} aria-hidden="true"/><h2>이 페이지를 읽는 방법</h2></div><p>‘주목할 흐름’은 최근 확인한 기술 변화, ‘꾸준한 프로젝트’는 반복해서 쓰는 기반 작업을 기준으로 선정했습니다. 별 개수에 따른 순위나 안정성 점수는 제공하지 않습니다. 릴리스·공지의 발표일과 확인일을 구분하며, 상시 문서는 발표일을 임의로 붙이지 않습니다.</p><p>자동 갱신되지 않는 {dateLabel(githubCheckedAt)} 스냅샷입니다. 설치·업데이트 전 각 항목의 공식 원문에서 현재 조건을 확인하세요. 릴리스 날짜는 UTC 기준입니다.</p></aside>
  </>;
}
