'use client';
import Link from '@/components/Link';
import {useState,useEffect} from 'react';
import {api} from './Provider';
import type {Tool} from '@/lib/catalog';
import {dateLabel} from '@/lib/content';
import {ArrowRight} from './Icons';

export const ratingAxes={quality:'결과 품질',efficiency:'작업 효율',korean:'한국어',value:'비용 대비',workflow:'작업 연결'};
type Scores={axes:Record<string,{value:number;count:number}>;sample:number;tasks:string[];plans:string[];latest:string|null};
type ScoreState={key:string;status:'loading'|'success'|'error';scores:Scores|null;error:string};
type Options={toolId:string;tasks:string[];plans:string[]};

export default function ToolReviews({tool}:{tool:Tool}){
  const [filters,setFilters]=useState({task:'',plan:'',revision:0});
  const {task,plan,revision}=filters;
  const [state,setState]=useState<ScoreState>({key:'',status:'loading',scores:null,error:''});
  const [options,setOptions]=useState<Options>({toolId:tool.id,tasks:[],plans:[]});
  const requestKey=JSON.stringify([tool.id,task,plan,revision]);
  const requestPath='/api/scores?tool='+encodeURIComponent(tool.id)+'&task='+encodeURIComponent(task)+'&plan='+encodeURIComponent(plan);
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

  return <div className="tool-reviews">
    <div className="section-heading">
      <div><span className="eyebrow">사용자 경험</span><h2 id="reviews-title">업무별 평가</h2></div>
      <Link href={'/community?write=review&tool='+tool.id} className="text-link review-write">평가 작성<ArrowRight size={14}/></Link>
    </div>
    <div className="review-direct note">
      <h3>검수된 직접 평가</h3>
      <p><strong>미평가</strong> · 직접 평가 결과가 등록되지 않았습니다. 아래 항목은 사용자가 입력한 경험의 평균입니다.</p>
    </div>
    <div className="review-filters">
      <label>업무<select aria-label="평가 업무" value={task} onChange={event=>{const value=event.target.value;setFilters(current=>({...current,task:value,revision:current.revision+1}));}}><option value="">모든 업무</option>{tasks.map(value=><option key={value} value={value}>{value}</option>)}</select></label>
      <label>플랜<select aria-label="평가 플랜" value={plan} onChange={event=>{const value=event.target.value;setFilters(current=>({...current,plan:value,revision:current.revision+1}));}}><option value="">모든 플랜</option>{plans.map(value=><option key={value} value={value}>{value}</option>)}</select></label>
    </div>
    <p className={'review-status'+(loading?' is-loading':'')} role="status" aria-live="polite" aria-atomic="true">{status}</p>
    <div className="review-results" aria-busy={loading}>
      {error?<div className="error review-error"><p>{error}</p><button type="button" className="button ghost small" onClick={()=>setFilters(current=>({...current,revision:current.revision+1}))}>다시 불러오기</button></div>:scores?<>
        <p className="review-updated">후기 갱신일 {scores.latest?<time dateTime={scores.latest}>{dateLabel(scores.latest)}</time>:'갱신 기록 없음'}</p>
        <div className="score-grid">{Object.entries(ratingAxes).map(([id,label])=>{
          const axis=scores.axes[id],count=axis?.count||0,assessed=count>0;
          return <div className="score-row" key={id}>
            <span>{label}<small className="review-axis-count">응답 {count}건</small></span>
            <div className="score-track" aria-hidden="true"><span style={{width:(assessed?axis.value:0)*20+'%'}}/></div>
            <div className="review-axis-result"><strong>{assessed?axis.value.toFixed(1)+' / 5':'미평가'}</strong>{assessed&&count<5&&<span className="review-axis-note">소수 응답 평균</span>}</div>
          </div>;
        })}</div>
        <p className="review-method">계정·도구별 최신 공개 후기 1건 집계 · 후기에 점수가 없을 수 있으며 항목별 응답 수는 다를 수 있습니다.</p>
        {!hasResponses&&<div className="review-empty"><p>{scores.sample===0?'선택한 조건에 집계할 후기가 없습니다.':'이 조건의 후기에는 항목별 점수 응답이 아직 없습니다.'}</p><a className="text-link" href="#features">공식 기능 확인<ArrowRight size={14}/></a><Link className="text-link" href="/guides">시작 가이드 보기<ArrowRight size={14}/></Link></div>}
      </>:null}
    </div>
    <Link className="text-link review-related" href={'/community?tool='+tool.id}>관련 후기와 질문 보기<ArrowRight size={15}/></Link>
  </div>;
}
