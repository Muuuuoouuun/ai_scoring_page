import guideData from '@/data/guides.json';
import eventData from '@/data/events.json';
import {catalog} from './catalog';
export type Guide={id:string;title:string;toolIds:string[];category:string;summary:string;goal:string;requirements:string[];steps:string[];pitfalls:string[];sampleInput:string;checks:string[];recovery:string[];sourceUrls:string[];checkedAt:string;executionCheck?:{performedAt:string;method:'agent-ui';inputRows:number;results:string[]}};
export type Event={id:string;title:string;organizer:string;toolIds:string[];type:string;date:string;startTime:string;endTime:string;timeZone:string;startsAt:string;endsAt:string;location:string;url:string;cost:string;eligibility:string;summary:string;sourceUrls:string[];checkedAt:string};
export const guides=guideData as unknown as Guide[];
export const events=eventData as Event[];
export const updates=catalog.filter(t=>t.latestUpdate).map(t=>({...t.latestUpdate,id:t.id,tool:t})).sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));
export const dateLabel=(date?:string|null)=>date?date.slice(0,10).replaceAll('-','. '):'게시일 미확인';
