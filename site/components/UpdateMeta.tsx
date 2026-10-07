import type {Tool} from '@/lib/catalog';
import {dateLabel} from '@/lib/content';

export default function UpdateMeta({update,checkedAt,compact=false}:{update:Tool['latestUpdate'];checkedAt:string;compact?:boolean}){
  return <div className={'update-meta'+(compact?' compact':'')}>
    <span className="metadata">{compact?'게시 ':'공식 출처 · 게시 '}{dateLabel(update.publishedAt)} · 확인 {dateLabel(checkedAt)}</span>
    {update.statusLabel&&<span className="badge gray update-state" title={update.rollout}>{update.statusLabel}</span>}
  </div>;
}
