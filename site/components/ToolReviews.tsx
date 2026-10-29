'use client';
import Link from '@/components/Link';
import {useState,useEffect} from 'react';
import {api} from './Provider';
import type {Tool} from '@/lib/catalog';
import type {ReviewScores,ReviewRatingAxis} from '@/lib/review-scores';
import {ArrowRight,RefreshCw} from './Icons';
export const ratingAxes={quality:'결과 품질',efficiency:'작업 효율',korean:'한국어',value:'비용 대비',workflow:'작업 연결'};
type Scores=ReviewScores;

export default function ToolReviews({tool}:{tool:Tool}){
  const [result,setResult]=useState<{key:string;data:Scores|null;error:string}|null>(null);
  const [options,setOptions]=useState<{toolId:string;tasks:string[];plans:string[]}>({toolId:tool.id,tasks:[],plans:[]});
  const [filters,setFilters]=useState({task:'',plan:'',revision:0});
  const {task,plan,revision:retry}=filters;
  const key=JSON.stringify([tool.id,task,plan,retry]);
  useEffect(()=>{
    let alive=true;
    api<Scores>('/api/scores?tool='+encodeURIComponent(tool.id)+'&task='+encodeURIComponent(task)+'&plan='+encodeURIComponent(plan))
      .then(data=>{if(alive){setOptions({toolId:tool.id,tasks:data.tasks,plans:data.plans});setResult({key,data,error:''});}})
      .catch(error=>{if(alive)setResult({key,data:null,error:error instanceof Error?error.message:'평가를 불러오지 못했습니다. 다시 시도해주세요.'});});
    return()=>{alive=false;};
  },[tool.id,task,plan,retry,key]);
  const loading=result?.key!==key;
  const scores=loading?null:result?.data;
  const error=loading?'':result?.error;
  const choices=options.toolId===tool.id?options:{tasks:[],plans:[]};
  const tasks=[...new Set([...choices.tasks,...(task?[task]:[])])];
  const plans=[...new Set([...choices.plans,...(plan?[plan]:[])])];
  return <>
    <div className="section-heading"><h2 id="reviews-title" style={{margin:0}}>업무별 평가</h2><Link href={'/community?write=review&tool='+tool.id} className="text-link">평가 작성<ArrowRight size={16}/></Link></div>
    <div className="note" style={{marginBottom:18}}>검수된 직접 평가 <strong>미평가</strong> · 아래 점수는 사용자가 입력한 경험입니다. 성능 실험 결과와 구분해서 확인하세요.</div>
    <div className="filters"><label className="filter-field"><span>평가 업무</span><select aria-label="평가 업무" value={task} onChange={e=>{const value=e.target.value;setFilters(current=>({...current,task:value,revision:current.revision+1}));}}><option value="">모든 업무</option>{tasks.map(t=><option key={t}>{t}</option>)}</select></label><label className="filter-field"><span>평가 요금제</span><select aria-label="평가 요금제" value={plan} onChange={e=>{const value=e.target.value;setFilters(current=>({...current,plan:value,revision:current.revision+1}));}}><option value="">모든 요금제</option>{plans.map(p=><option key={p}>{p}</option>)}</select></label></div>
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{loading?`${task||'모든 업무'} · ${plan||'모든 요금제'} · 평가를 불러오는 중입니다.`:error?'평가를 불러오지 못했습니다.':`${task||'모든 업무'} · ${plan||'모든 요금제'} · 집계 대상 후기 ${scores?.sample||0}건입니다.`}</p>
    <div aria-busy={loading}>
      {loading?<div className="score-loading"><RefreshCw size={18} aria-hidden="true"/>선택한 조건의 평가를 불러오는 중입니다.</div>:error?<div className="error score-error"><span>{error}</span><button className="button secondary small" type="button" onClick={()=>setFilters(current=>({...current,revision:current.revision+1}))}>다시 불러오기<RefreshCw size={15}/></button></div>:scores&&<>
        <div className="score-summary"><div><span className="eyebrow">사용자 경험</span><h3>{scores.ratedReviewCount?`점수를 남긴 후기 ${scores.ratedReviewCount}건`:'아직 점수 응답이 없습니다'}</h3><p className="metadata">집계 대상 후기 {scores.sample}건 · 5점 척도</p></div><div className="score-highlights">{(['quality','efficiency'] as const).map(id=>{const result=scores.axes[id],axis=result&&result.count>0?result:undefined;return <div key={id}><span>{ratingAxes[id]}</span><strong>{axis?axis.value.toFixed(1):'미평가'}{axis&&<small>/ 5</small>}</strong><span className="metadata">응답 {axis?.count||0}건{axis&&axis.count<5?' · 소수 응답':''}</span></div>;})}</div></div>
        {scores.sample===0?<div className="score-empty"><h3>이 조건의 첫 경험을 기다리고 있어요.</h3><p>아직 집계할 후기가 없습니다. 사용한 업무와 요금제를 함께 남겨주세요.</p><a className="text-link" href="#features">공식 기능 확인<ArrowRight size={16}/></a> <Link className="text-link" href={'/community?write=review&tool='+tool.id}>사용 경험 남기기<ArrowRight size={16}/></Link></div>:<div className="score-grid">{Object.entries(ratingAxes).map(([id,label])=>{
          const result=scores.axes[id as ReviewRatingAxis],axis=result&&result.count>0?result:undefined;
          return <div className="score-row" key={id}><span>{label}<small className="metadata">응답 {axis?.count||0}건{axis&&axis.count<5?' · 소수 응답':''}</small></span><div className="score-track" aria-hidden="true"><span style={{width:(axis?.value||0)*20+'%'}}/></div><strong>{axis?axis.value.toFixed(1)+' / 5':'미평가'}</strong></div>;
        })}</div>}
        {scores.ratedReviewCount>0&&<details className="score-details"><summary>점수별 분포 보기</summary><div className="score-distributions">{(Object.keys(ratingAxes) as ReviewRatingAxis[]).map(id=>{const result=scores.axes[id],axis=result&&result.count>0?result:undefined;return axis&&<div key={id} className="score-distribution"><h4>{ratingAxes[id]} <span className="metadata">{axis.count}건</span></h4>{axis.distribution.map((count,i)=><div key={i} className="distribution-row"><span>{i+1}점</span><span className="distribution-bar" aria-hidden="true"><span style={{width:count/axis.count*100+'%'}}/></span><span>{count}건</span></div>)}</div>;})}</div></details>}
        <div className="score-meta">계정·도구별 최신 후기 1건 집계 · 항목별 응답 수는 다를 수 있습니다.{scores.latest&&<> 후기 갱신일 {scores.latest.slice(0,10)}.</>}</div>
        <p className="metadata">후기에 기록된 사용일: {scores.usedAtRange?(scores.usedAtRange.from===scores.usedAtRange.to?scores.usedAtRange.from:scores.usedAtRange.from+' ~ '+scores.usedAtRange.to):'미기재'}</p>
        {scores.evidence.length>0&&<details className="score-details"><summary>집계에 포함된 후기 {scores.evidenceTotal}건 확인</summary><ul className="review-evidence">{scores.evidence.map(review=><li key={review.id}><Link href={'/community/'+review.id}>{review.title}<ArrowRight size={14}/></Link><span className="metadata">{review.task} · {review.plan} · 사용일 {review.usedAt||'미기재'}</span><span className="metadata">{(Object.entries(review.ratings) as [ReviewRatingAxis,number][]).map(([id,value])=>ratingAxes[id]+' '+value+'/5').join(' · ')||'점수 없이 작성한 후기'}</span></li>)}</ul>{scores.evidenceTotal>scores.evidence.length&&<p className="metadata">최근 갱신된 {scores.evidence.length}건을 표시합니다. 평균은 대상 후기 전체를 집계합니다.</p>}</details>}
        {Object.values(scores.axes).some(axis=>axis.count>0&&axis.count<5)&&<p className="metadata">응답 5건 미만은 ‘소수 응답’으로 표시합니다. 평균은 전체 이용자의 경험을 대표하지 않습니다.</p>}
      </>}
    </div>
    <Link className="text-link" style={{marginTop:15}} href={'/community?tool='+tool.id}>관련 후기와 질문 보기<ArrowRight size={16}/></Link>
  </>;
}
