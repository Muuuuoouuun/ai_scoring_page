import Link from '@/components/Link';
import type {Tool} from '@/lib/catalog';
import {dateLabel} from '@/lib/content';
import {ArrowRight,ArrowUpRight} from '@/components/Icons';

export default function ServiceBrief({tool}:{tool:Tool}){
  const condition=tool.limitations[0]||tool.features.find(feature=>feature.status==='conditional')?.condition;
  const source=tool.sourceUrls[0];

  return <div className="service-brief">
    <div className="service-brief-uses">
      <h3>활용 업무</h3>
      <div className="service-use-links">{tool.useCases.map(useCase=><Link key={useCase} href={'/search?q='+encodeURIComponent(useCase)}>{useCase}</Link>)}</div>
    </div>
    <dl className="service-brief-facts">
      <div className="service-brief-price"><dt>요금 구조</dt><dd>{tool.pricing}</dd></div>
      <div><dt>이용 환경</dt><dd>{tool.platforms.join(' · ')}</dd></div>
      <div><dt>한국어</dt><dd>{tool.korean}</dd></div>
    </dl>
    {condition&&<div className="service-brief-condition"><h3>먼저 확인할 조건</h3><p>{condition}</p><a className="text-link" href="#features">기능별 조건 보기<ArrowRight size={14}/></a></div>}
    <div className="service-brief-provenance"><p>공식 자료 기준 · <time dateTime={tool.checkedAt}>{dateLabel(tool.checkedAt)}</time> 확인</p>{source&&<a className="text-link" href={source} target="_blank" rel="noreferrer">공식 자료<ArrowUpRight size={14}/></a>}</div>
  </div>;
}
