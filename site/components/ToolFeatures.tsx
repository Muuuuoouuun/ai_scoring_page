import type {Feature} from '@/lib/catalog';
import {ArrowUpRight} from './Icons';
const statuses={supported:{label:'지원',color:'green'},conditional:{label:'조건부 지원',color:'yellow'},unknown:{label:'확인 필요',color:'gray'}};

export default function ToolFeatures({features}:{features:Feature[]}){
  const status=(feature:Feature)=><span className={'badge '+statuses[feature.status].color}>{statuses[feature.status].label}</span>;
  const source=(feature:Feature)=><div className="feature-source"><a className="text-link" href={feature.sourceUrl} target="_blank" rel="noreferrer" aria-label={feature.name+' 공식 근거'}>공식 근거<ArrowUpRight size={14}/></a>{feature.checkedAt&&<span className="metadata">확인 {feature.checkedAt}</span>}</div>;
  const list=(items:Feature[])=><>
    <table className="feature-table feature-desktop"><caption className="sr-only">주요 기능의 지원 범위와 이용 조건·출처</caption><thead><tr><th scope="col">기능</th><th scope="col">지원 범위</th><th scope="col">이용 조건·출처</th></tr></thead><tbody>{items.map(f=><tr key={f.name}><th scope="row">{f.name}<small>{f.description}</small></th><td>{status(f)}</td><td>{f.condition||'추가 조건은 공식 문서를 확인하세요.'}{source(f)}</td></tr>)}</tbody></table>
    <div className="feature-mobile">{items.map(f=><article className="feature-item" key={f.name}><div><h3>{f.name}</h3>{status(f)}</div><p>{f.description}</p><p className="feature-condition"><strong>이용 조건</strong>{f.condition||'추가 조건은 공식 문서를 확인하세요.'}</p>{source(f)}</article>)}</div>
  </>;
  return <>{list(features.slice(0,4))}{features.length>4&&<details className="more-features"><summary>기능 {features.length-4}개 더 보기 <span className="metadata">전체 {features.length}개 기능</span></summary>{list(features.slice(4))}</details>}</>;
}
