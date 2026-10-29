'use client';
import {useState} from 'react';
import Link from './Link';
import {useApp} from './Provider';
import './discovery.css';
import {ToolCard} from './ToolUI';
import {ArrowRight} from './Icons';
import {catalog} from '@/lib/catalog';
import {discoveryTopics,topicHref,toolsForTopic,type DiscoveryTopic} from '@/lib/discovery-preferences';

export function DiscoveryPicks(){
  const {topics}=useApp();
  const [selected,setSelected]=useState<DiscoveryTopic|null>(null);
  const active=selected&&topics.includes(selected)?selected:topics[0];
  const matches=toolsForTopic(catalog,active);
  return <section className="section discovery-picks"><div className="section-heading"><div><span className="eyebrow">Your next tool</span><h2>관심 장르부터 둘러보세요</h2><p>확인된 기능을 기준으로 모았습니다. 기능과 조건을 비교해보세요.</p></div><Link className="text-link" href={topicHref(active)}>장르 전체 보기<ArrowRight size={16}/></Link></div><div className="discovery-tabs" role="group" aria-label="홈 관심 장르">{topics.map(topic=><button className={'chip'+(active===topic?' active':'')} aria-pressed={active===topic} key={topic} onClick={()=>setSelected(topic)}>{discoveryTopics[topic]}</button>)}</div><p className="sr-only" role="status">{discoveryTopics[active]} 도구 {matches.length}개 중 {Math.min(matches.length,6)}개 표시</p><div className="grid-3" key={active}>{matches.slice(0,6).map(tool=><ToolCard key={tool.id} tool={tool}/>)}</div></section>;
}
