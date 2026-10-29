import type {Tool} from '@/lib/catalog';
import {officialNotes} from '@/lib/official-notes';
import {dateLabel} from '@/lib/content';
import {ArrowUpRight} from './Icons';

export default function ToolEditorial({tool}:{tool:Tool}){
 const notes=officialNotes(tool.id);
 if(!notes)return <p className="note">공식 블로그·공지 요약을 준비하고 있습니다. <a href={tool.latestUpdate.sourceUrl} target="_blank" rel="noreferrer">공식 원문 확인</a></p>;
 return <div className="official-digest">
  <div className="digest-intro"><span className="eyebrow">Official brief</span><p>{notes.overview}</p><span className="metadata">공식 문서 요약 · 확인 {dateLabel(notes.checkedAt)}{notes.verification==='partial'?' · 일부 최신 소식 확인 제한':''}</span></div>
  <div className="digest-features"><h3>기능 한눈에</h3><ul>{notes.features.slice(0,3).map(f=><li key={f.name}><strong>{f.name}</strong><p>{f.description}</p>{f.condition&&<span className="metadata">{f.condition}</span>}</li>)}</ul></div>
  <div className="update-history"><h3>확인한 업데이트</h3>{notes.updates.map(update=><article key={update.id} className="update-entry"><div className="update-date"><span>{dateLabel(update.publishedAt)}</span>{!update.publishedAt&&<span className="metadata">원문에 정확한 날짜 없음</span>}</div><div><h4><a href={update.sourceUrl} target="_blank" rel="noreferrer">{update.title}<ArrowUpRight size={14}/></a></h4><p>{update.summary}</p>{update.highlights.length>0&&<ul className="update-highlights">{update.highlights.map(item=><li key={item}>{item}</li>)}</ul>}<details className="update-conditions"><summary>적용 대상·제공 조건</summary><p>{update.audience}</p><p>{update.rollout}</p></details></div></article>)}</div>
  <div className="digest-sources"><span>공식 채널</span>{notes.sources.map(source=><a key={source.url} className="text-link" href={source.url} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={14}/></a>)}</div>
  {notes.notes.length>0&&<details className="digest-notes"><summary>확인 범위와 참고 사항</summary><ul>{notes.notes.map(note=><li key={note}>{note}</li>)}</ul></details>}
 </div>;
}
