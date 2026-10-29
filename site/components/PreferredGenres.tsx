'use client';
import {useState} from 'react';
import Link from './Link';
import {useApp} from './Provider';
import './discovery.css';
import Modal from './Modal';
import {defaultTopics,discoveryTopics,topicHref,type DiscoveryTopic} from '@/lib/discovery-preferences';

export function PreferredGenres(){
  const {topics,saveTopics}=useApp();
  const [editing,setEditing]=useState(false),[draft,setDraft]=useState<DiscoveryTopic[]>(topics);
  return <><div className="preferred-genres"><div className="preferred-inner"><span className="preferred-label">내 관심 장르</span><nav aria-label="선호 장르" className="preferred-links">{topics.map(topic=><Link key={topic} href={topicHref(topic)}>{discoveryTopics[topic]}</Link>)}</nav><button className="preferred-edit" onClick={()=>{setDraft(topics);setEditing(true);}}>장르 설정</button></div></div>{editing&&<Modal title="내 관심 장르" onClose={()=>setEditing(false)}><p className="discovery-description">자주 찾는 장르를 1~6개 골라주세요. 상단 바로가기와 홈 탐색에 반영하며, 이 브라우저에 저장합니다.</p><div className="discovery-choices">{Object.entries(discoveryTopics).map(([id,label])=>{const topic=id as DiscoveryTopic;return <label key={id} className={'discovery-choice'+(draft.includes(topic)?' selected':'')}><input type="checkbox" checked={draft.includes(topic)} disabled={!draft.includes(topic)&&draft.length>=6} onChange={e=>setDraft(current=>e.target.checked?[...current,topic]:current.filter(t=>t!==topic))}/>{label}</label>;})}</div><p className="metadata" role="status">{draft.length}/6개 선택 · 선택한 순서로 표시합니다.</p><div className="actions discovery-dialog-actions"><button className="button primary" disabled={!draft.length} onClick={()=>{saveTopics(draft);setEditing(false);}}>장르 저장</button><button className="button ghost" onClick={()=>setDraft(defaultTopics)}>기본 장르로</button></div></Modal>}</>;
}
