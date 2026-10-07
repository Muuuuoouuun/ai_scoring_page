'use client';
import Link from '@/components/Link';
import {useState,useEffect,type ReactNode} from 'react';
import {api} from './Provider';
import type {Tool} from '@/lib/catalog';
import {dateLabel} from '@/lib/content';
import {ArrowRight} from './Icons';
import {ratingAxes,ratingDescriptions,type RatingAxis,type Scores} from '@/lib/scoring';
import '@/app/tool-reviews.css';

export {ratingAxes} from '@/lib/scoring';
type ScoreState={key:string;status:'loading'|'success'|'error';scores:Scores|null;error:string};
type Options={toolId:string;tasks:string[];plans:string[]};

function revealFeatureEvidence(root:Document|HTMLElement){
  const target=root.querySelector<HTMLElement>('#features');
  const disclosure=target?.closest('details');
  if(disclosure)disclosure.open=true;
  return target;
}

export default function ToolReviews({tool,children}:{tool:Tool;children?:ReactNode}){
  const [filters,setFilters]=useState({task:'',plan:'',revision:0});
  const {task,plan,revision}=filters;
  const [state,setState]=useState<ScoreState>({key:'',status:'loading',scores:null,error:''});
  const [options,setOptions]=useState<Options>({toolId:tool.id,tasks:[],plans:[]});
  const requestKey=JSON.stringify([tool.id,task,plan,revision]);
  const requestPath='/api/scores?tool='+encodeURIComponent(tool.id)+'&task='+encodeURIComponent(task)+'&plan='+encodeURIComponent(plan);
  useEffect(()=>{
    if(typeof window==='undefined')return;
    const reveal=()=>{if(window.location.hash==='#features')revealFeatureEvidence(document)?.scrollIntoView({block:'start'});};
    reveal();
    window.addEventListener('hashchange',reveal);
    return()=>window.removeEventListener('hashchange',reveal);
  },[tool.id]);
  useEffect(()=>{
    let active=true;
    api<Scores>(requestPath).then(scores=>{
      if(!active)return;
      setOptions({toolId:tool.id,tasks:scores.tasks,plans:scores.plans});
      setState({key:requestKey,status:'success',scores,error:''});
    }).catch(error=>{
      if(active)setState({key:requestKey,status:'error',scores:null,error:error instanceof Error?error.message:'평가를 불러오지 못했습니다. 다시 시도해주세요.'});
    });
    return()=>{active=false;};
  },[tool.id,requestKey,requestPath]);

  // A filter change renders before its effect starts. Only the matching request
  // may supply numbers, dates or errors during that render.
  const loading=state.key!==requestKey||state.status==='loading';
  const scores=!loading&&state.status==='success'?state.scores:null;
  const error=!loading&&state.status==='error'?state.error:'';
  const choices=options.toolId===tool.id?options:{tasks:[],plans:[]};
  const tasks=[...new Set([...choices.tasks,...(task?[task]:[])])];
  const plans=[...new Set([...choices.plans,...(plan?[plan]:[])])];
  const conditions=(task||'모든 업무')+' · '+(plan||'모든 플랜');
  const status=loading?conditions+' · 평가를 불러오고 있습니다.':error?conditions+' · 평가를 불러오지 못했습니다. 다시 불러오기를 눌러 재시도해주세요.':conditions+' · 집계 대상 후기 '+(scores?.sample||0)+'건';
  const hasResponses=scores&&Object.values(scores.axes).some(axis=>axis.count>0);

  return <div className="tool-reviews" onClick={event=>{
    if(event.target instanceof Element&&event.target.closest('a[href="#features"]'))revealFeatureEvidence(event.currentTarget);
  }}>
    <section className="service-scorecard" id="ratings" aria-labelledby="ratings-title">
      <div className="scorecard-heading"><span className="eyebrow">AIs 평가</span><Link className="text-link" href="/about">평가 기준<ArrowRight size={14}/></Link></div>
      <h2 id="ratings-title" className="sr-only">티어와 서브 점수</h2>
      <div className="service-tier">
        <div className="service-tier-display"><span>직접 평가 티어</span><strong>미평가</strong><span className="tier-pending">평가 등록 전</span></div>
        <div className="service-tier-context"><h3>직접 평가를 기다리고 있어요.</h3><p>검수된 직접 평가 결과가 등록되지 않았습니다. 평가 과제와 근거가 확인되면 티어를 공개합니다.</p><a className="text-link" href="#reviews">유저평으로 사용 경험 살펴보기<ArrowRight size={14}/></a></div>
      </div>
      <div className="subscores-heading"><h3>유저평 서브 점수</h3><span>5점 만점 · 선택한 업무·플랜 기준</span></div>
      <div className="review-summary-axes" aria-busy={loading}>{Object.entries(ratingAxes).map(([key,label])=>{
        const axis=scores?.axes[key as RatingAxis],count=axis?.count||0;
        return <div className="review-summary-axis" key={key}><span>{label}</span><strong>{loading?'불러오는 중':error?'확인 불가':axis&&count>0?axis.value.toFixed(1)+' / 5':'미평가'}</strong><p>{scores?'응답 '+count+'건'+(count>0&&count<5?' · 소수 응답 평균':''):loading?'응답 확인 중':'다시 불러와 주세요'}</p></div>;
      })}</div>
      <div className="review-filter-bar"><div className="review-filter-copy"><strong>내 사용 조건으로 보기</strong><p>서브 점수와 유저평에 함께 적용됩니다.</p></div>
    <div className="review-filters">
      <label>업무<select aria-label="평가 업무" value={task} onChange={event=>{const value=event.target.value;setFilters(current=>({...current,task:value,revision:current.revision+1}));}}><option value="">모든 업무</option>{tasks.map(value=><option key={value} value={value}>{value}</option>)}</select></label>
      <label>플랜<select aria-label="평가 플랜" value={plan} onChange={event=>{const value=event.target.value;setFilters(current=>({...current,plan:value,revision:current.revision+1}));}}><option value="">모든 플랜</option>{plans.map(value=><option key={value} value={value}>{value}</option>)}</select></label>
    </div></div>
    <p className={'review-status'+(loading?' is-loading':'')} role="status" aria-live="polite" aria-atomic="true">{status}</p>
    <div className="review-results" aria-busy={loading}>
      {error?<div className="error review-error"><p>{error}</p><button type="button" className="button ghost small" onClick={()=>setFilters(current=>({...current,revision:current.revision+1}))}>다시 불러오기</button></div>:scores?<>
        <div className="review-sample-meta"><span>점수 입력 후기 {scores.ratedSample}건</span><span>후기 갱신일 {scores.latest?<time dateTime={scores.latest}>{dateLabel(scores.latest)}</time>:'갱신 기록 없음'}</span></div>
        {(!task||!plan)&&hasResponses&&<p className="review-context-note">선택하지 않은 업무·플랜에는 여러 사용 조건의 응답이 섞일 수 있습니다.</p>}
        {hasResponses?<details className="review-full-details"><summary>전체 항목 설명·점수 분포 보기</summary>
        <div className="score-grid">{Object.entries(ratingAxes).map(([key,label])=>{
          const id=key as RatingAxis;
          const axis=scores.axes[id],count=axis?.count||0,assessed=count>0;
          return <div className="review-axis" key={id}><div className="score-row">
            <span>{label}<small className="review-axis-count">응답 {count}건</small></span>
            {assessed&&axis?<div className="score-track" aria-hidden="true"><span style={{width:axis.value*20+'%'}}/></div>:<span/>}
            <div className="review-axis-result"><strong>{assessed&&axis?axis.value.toFixed(1)+' / 5':'미평가'}</strong>{assessed&&count<5&&<span className="review-axis-note">소수 응답 평균</span>}</div>
          </div><p className="review-axis-description">{ratingDescriptions[id]}</p>{assessed&&axis?.distribution&&<dl className="review-distribution" aria-label={label+' 응답 분포'}>{axis.distribution.map((amount,index)=><div key={index}><dt>{index+1}점</dt><dd>{amount}건</dd></div>)}</dl>}{assessed&&axis&&axis.fractionalCount>0&&<p className="review-axis-description">소수점 응답 {axis.fractionalCount}건 · 정수 점수 분포와 별도로 평균과 응답 수에 포함합니다.</p>}</div>;
        })}</div>
        <p className="review-method">항목 설명은 점수를 읽는 안내입니다. 작성 당시 같은 평가 기준이나 실험 조건을 적용했다는 뜻은 아닙니다.</p>
        </details>:null}
        {!hasResponses&&<p className="review-context-note">{scores.sample===0?'선택한 조건에 집계할 후기가 없습니다.':'이 조건의 후기에는 항목별 점수 응답이 아직 없습니다.'}</p>}
        <details className="review-evidence"><summary>집계 방식과 사용일 범위 확인</summary><p className="review-method">계정·도구별 최신 공개 후기 1건을 고른 뒤 업무·플랜 조건을 적용합니다. 후기에 점수가 없을 수 있으며 항목별 응답 수는 다를 수 있습니다. 무응답은 평균에서 제외합니다.</p><p className="review-method">소수 응답 표시는 1–4건 평균을 해석하는 안내이며, 5건 이상도 대표성이나 검증된 성능을 보장하지 않습니다.</p><p className="review-used-range">사용일 범위 {scores.usedAtRange?.earliest&&scores.usedAtRange?.latest?<><time dateTime={scores.usedAtRange.earliest}>{dateLabel(scores.usedAtRange.earliest)}</time> ~ <time dateTime={scores.usedAtRange.latest}>{dateLabel(scores.usedAtRange.latest)}</time></>:'기록 없음'} · 후기에 작성한 사용일 기준</p></details>
      </>:null}
    </div>
    </section>
    {children}
    <section className="user-reviews-section" id="reviews" aria-labelledby="reviews-title">
      <div className="section-heading"><div><span className="eyebrow">사용자 경험</span><h2 id="reviews-title">유저평</h2></div><Link href={'/community?write=review&tool='+tool.id} className="button secondary review-write">경험 작성<ArrowRight size={15}/></Link></div>
      <div className="user-reviews-context"><p>현재 점수 집계에 포함된 최근 후기입니다.</p><a className="text-link" href="#ratings">{conditions}<ArrowRight size={14}/></a></div>
      <div aria-busy={loading}>
        {loading?<p className="review-list-loading" role="status">선택한 조건의 후기를 불러오고 있습니다.</p>:error?<div className="review-empty"><h3>후기를 불러오지 못했습니다.</h3><p>위 평가 영역에서 다시 불러오기를 눌러주세요.</p><a className="text-link" href="#ratings">평가 영역으로<ArrowRight size={14}/></a></div>:scores?.recentReviews?.length?<>
          <p className="review-list-meta">집계 대상 {scores.sample}건 중 최근 갱신된 {scores.recentReviews.length}건 · 점수 없는 후기도 포함</p>
          <div className="user-review-grid">{scores.recentReviews.map(review=><article className="user-review-card" key={review.id}>
            <div className="user-review-author"><span className="review-avatar" aria-hidden="true">{Array.from(review.author||'사용자')[0]}</span><div><strong>{review.author||'사용자'}</strong><span>{review.affiliation==='maker'?'제작·운영 관계자':review.affiliation==='sponsored'?'제품·비용 지원받음':'사용 후기'}</span></div><span className="review-original-label">공개 원문</span></div>
            <h3><Link href={'/community/'+review.id}>{review.title}</Link></h3>
            <p className="user-review-excerpt">{review.excerpt||'본문은 원문에서 확인할 수 있습니다.'}</p>
            <div className="user-review-tags"><span>{review.task||'업무 미확인'}</span><span>{review.plan||'플랜 미확인'}</span></div>
            <div className="user-review-ratings">{Object.entries(review.ratings).length?Object.entries(review.ratings).map(([key,value])=><span key={key}>{ratingAxes[key as RatingAxis]} <strong>{value} / 5</strong></span>):<span>항목별 점수 미입력</span>}</div>
            <div className="user-review-bottom"><p>사용일 {review.usedAt?<time dateTime={review.usedAt}>{dateLabel(review.usedAt)}</time>:'미확인'}<br/>후기 갱신일 <time dateTime={review.updatedAt}>{dateLabel(review.updatedAt)}</time></p><Link className="text-link" href={'/community/'+review.id} aria-label={review.title+' 원문 읽기'}>원문 읽기<ArrowRight size={16}/></Link></div>
          </article>)}</div>
        </>:<div className="review-empty"><span className="empty-review-symbol" aria-hidden="true">“</span><h3>이 조건의 첫 사용 경험을 기다려요.</h3><p>어떤 업무에 활용했고, 무엇이 도움이 되었는지 남겨주세요.</p><div className="actions"><Link className="button secondary" href={'/community?write=review&tool='+tool.id}>첫 후기 작성<ArrowRight size={15}/></Link><a className="text-link" href="#features">공식 기능 확인<ArrowRight size={14}/></a></div></div>}
      </div>
      <div className="review-footer"><p>사용자가 작성한 경험이며, 검증된 성능 평가와 다릅니다.</p><Link className="text-link review-related" href={'/community?tool='+tool.id}>관련 후기와 질문 보기<ArrowRight size={15}/></Link></div>
    </section>
  </div>;
}
