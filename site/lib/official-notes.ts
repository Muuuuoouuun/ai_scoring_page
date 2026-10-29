import entries from '@/data/tool-editorial.json';
import type {Feature} from './catalog';
export type OfficialUpdate={id:string;title:string;summary:string;highlights:string[];publishedAt:string|null;sourceUrl:string;audience:string;rollout:string};
export type OfficialNotes={toolId:string;checkedAt:string;verification:'verified'|'partial'|'unavailable';overview:string;sources:{kind:'blog'|'changelog'|'docs';label:string;url:string}[];features:Feature[];updates:OfficialUpdate[];notes:string[]};
export function officialNotes(toolId:string){return (entries as OfficialNotes[]).find(entry=>entry.toolId===toolId);}
