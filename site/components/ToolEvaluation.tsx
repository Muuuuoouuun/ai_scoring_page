import {ArrowUpRight} from './Icons';
import {axisLabels,badgeLabels,capabilityLabels,impactLabels,levelLabels,tierLabels,tierTone,verdictOf,evaluationRank,type Evaluation,type ScoreAxis} from '@/lib/evaluations';

const levelTone:Record<string,string>={full:'green',partial:'yellow',none:'gray'};
const historyTone:Record<string,string>={high:'red',medium:'yellow',low:'gray'};
const historyLabel:Record<string,string>={high:'영향도 높음',medium:'영향도 중간',low:'영향도 낮음'};
const axisOrder:ScoreAxis[]=['functionality','uiux','reliability','comfort','pricing'];

/**
 * Editorial assessment from public sources. Kept visually and textually separate from the
 * community review scores in ToolReviews, and never labeled as a vendor benchmark.
 */
export default function ToolEvaluation({toolId,toolName,evaluation}:{toolId:string;toolName:string;evaluation:Evaluation}){
 const verdict=verdictOf(evaluation),rank=evaluationRank(toolId);
 return <>
  <section className="section" id="assessment">
   <div className="section-heading"><div><h2>편집 평가</h2><p>공개된 공식 문서·요금 페이지·외부 리뷰를 조사해 편집팀이 매긴 점수입니다. 아래 사용자 후기 집계와는 별개이며 공식 성능 실험 결과가 아닙니다.</p></div><span className={'badge '+tierTone[verdict.tier]}>{tierLabels[verdict.tier]}</span></div>
   <p className="body-copy">{evaluation.verdict}</p>
   <div className="money-grid" style={{marginTop:22}}>
    <div className="money-card"><small>종합 점수</small><strong>{verdict.composite}</strong><p>편집 {verdict.editorial}{verdict.external?' · 외부 '+verdict.external.score+'('+verdict.external.count+'개 사이트)':' · 외부 평점 없음'}</p></div>
    <div className="money-card"><small>별점 환산</small><strong>{verdict.stars.toFixed(1)}</strong><p>5점 만점 환산값입니다.</p></div>
    {rank&&<div className="money-card"><small>편집 평가 순위</small><strong>{rank.rank}위</strong><p>평가한 {rank.total}개 도구 기준입니다.</p></div>}
   </div>
   <div className="score-grid" style={{marginTop:24}}>
    {axisOrder.map(axis=><div className="score-row" key={axis}><span>{axisLabels[axis]}</span><span className="score-track"><span style={{width:evaluation.scores[axis]+'%'}}/></span><strong>{evaluation.scores[axis]}</strong></div>)}
   </div>
   <span className="score-meta">종합 = 편집 점수 70% + 외부 사이트 평점 30% · 조사 기준 {evaluation.checkedAt}</span>
   <div className="grid-2" style={{marginTop:8}}>
    <div>
     <h3>사람 중심 임팩트</h3>
     <div className="score-grid" style={{marginTop:14}}>{Object.entries(evaluation.impact).map(([key,value])=><div className="score-row" key={key}><span>{impactLabels[key]}</span><span className="score-track"><span style={{width:value*10+'%'}}/></span><strong>{value}/10</strong></div>)}</div>
    </div>
    <div>
     <h3>판단 배지</h3>
     <div className="actions" style={{marginTop:14}}>{Object.entries(evaluation.badges).filter(([,on])=>on).map(([key])=><span className={'badge '+(key==='lockinRisk'?'red':key==='thinkCarefully'?'yellow':'green')} key={key}>{badgeLabels[key]}</span>)}</div>
     <p className="metadata" style={{marginTop:14}}>{evaluation.pricingSummary}</p>
     {evaluation.koreaNote&&<p className="metadata" style={{marginTop:10}}>한국 팀 참고 · {evaluation.koreaNote}</p>}
    </div>
   </div>
   {evaluation.externalRatings.length>0&&<div className="line-section"><h3>다른 사이트 평가</h3><ul className="info-list" style={{marginTop:14}}>{evaluation.externalRatings.map(r=><li key={r.source+r.score}><span>{r.url?<a className="text-link" href={r.url} target="_blank" rel="noreferrer">{r.source}<ArrowUpRight size={12}/></a>:r.source}{r.note&&<small className="metadata">{r.note}</small>}</span><strong>{r.score}</strong></li>)}</ul></div>}
  </section>

  <section className="section" id="head-to-head">
   <div className="section-heading"><div><h2>경쟁 도구와 비교</h2><p>{toolName}에서 되는 것과 안 되는 것을 도구별로 정리했습니다.</p></div></div>
   <div className="table-scroll"><table className="feature-table"><thead><tr><th>비교 대상</th><th>{toolName}가 더 잘하는 것</th><th>{toolName}가 약한 것</th></tr></thead><tbody>{evaluation.comparisons.map(c=><tr key={c.competitor}><td>{c.competitor}</td><td>{c.better}</td><td>{c.weaker}</td></tr>)}</tbody></table></div>
  </section>

  {evaluation.history.length>0&&<section className="section" id="history">
   <div className="section-heading"><div><h2>변경·장애 이력</h2><p>요금제 개편, 모델 교체, 장애와 정책 변경처럼 도입 판단에 영향을 주는 변화만 골랐습니다.</p></div></div>
   <div className="table-scroll"><table className="data-table"><thead><tr><th>시점</th><th>변경</th><th>확인할 점</th><th>영향도</th></tr></thead><tbody>{evaluation.history.map(h=><tr key={h.date+h.title}><td>{h.date}</td><td><strong>{h.title}</strong><small className="metadata" style={{marginTop:5}}>{h.change}</small></td><td>{h.risk}</td><td><span className={'badge '+historyTone[h.level]}>{historyLabel[h.level]}</span></td></tr>)}</tbody></table></div>
  </section>}

  {evaluation.playbook.length>0&&<section className="section" id="playbook">
   <div className="section-heading"><div><h2>실무에 붙이는 방법</h2><p>도입한 팀이 바로 쓸 수 있는 운영 방식과 지켜야 할 기준입니다.</p></div></div>
   <ol className="steps">{evaluation.playbook.map(p=><li key={p.title}><strong>{p.title}</strong><p style={{fontSize:13,marginTop:6}}>{p.how}</p><p className="metadata" style={{marginTop:8}}>기준 · {p.tip}</p></li>)}</ol>
  </section>}

  {evaluation.sources.length>0&&<section className="section" id="assessment-sources">
   <div className="section-heading"><div><h2>평가에 참고한 자료</h2><p>점수와 이력의 근거입니다. 숫자가 출처마다 다를 때는 본문에 그렇게 적었습니다.</p></div></div>
   <div className="source-links">{evaluation.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.label}<ArrowUpRight size={12}/></a>)}</div>
  </section>}
 </>;
}

/** 상세 페이지 사이드바에 넣는 기능 지원 요약. */
export function CapabilitySummary({evaluation}:{evaluation:Evaluation}){
 if(!evaluation.capabilities)return null;
 return <div className="line-section"><span className="eyebrow">기능 지원</span><ul className="info-list" style={{marginTop:14}}>{Object.entries(evaluation.capabilities).map(([key,value])=><li key={key}><span>{capabilityLabels[key]??key}</span><strong title={value.note||undefined}><span className={'badge '+levelTone[value.level]}>{levelLabels[value.level]}</span></strong></li>)}</ul><span className="metadata" style={{marginTop:12}}>공식 요금·도움말 페이지 기준 조사값입니다. 조건은 플랜에 따라 달라질 수 있습니다.</span></div>;
}
