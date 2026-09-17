import {searchCatalog} from '@/lib/catalog';
import {guides,events,updates} from '@/lib/content';
import {rows} from '@/lib/db';
import {json,failure,ApiError} from '@/lib/http';
export const dynamic='force-dynamic';
type Result={id:string;type:string;title:string;summary:string;href:string;meta:string;score:number};
const types=['tool','guide','news','event','community','comparison'];
export async function GET(request:Request){try{
 const params=new URL(request.url).searchParams,q=(params.get('q')||'').trim(),type=params.get('type')||'all';
 if(q.length>160||type!=='all'&&!types.includes(type))throw new ApiError(400,'검색 조건을 확인해주세요.');
 if(!q)return json({results:[],counts:{},total:0,partial:false});
 const query=q.toLocaleLowerCase(),terms=query.split(/\s+/).filter(Boolean);
 const relevance=(title:string,body:string)=>{const t=title.toLocaleLowerCase(),text=(title+' '+body).toLocaleLowerCase();return t===query?40:t.includes(query)?20:terms.every(word=>text.includes(word))?5:0;};
 const results:Result[]=searchCatalog(q).map(t=>({id:t.id,type:'tool',title:t.name,summary:t.summary,href:'/tools/'+t.id,meta:t.vendor,score:t.relevance}));
 for(const g of guides)results.push({id:g.id,type:'guide',title:g.title,summary:g.summary,href:'/guides/'+g.id,meta:'활용 가이드',score:relevance(g.title,[g.summary,g.goal,...g.steps].join(' '))});
 for(const n of updates)results.push({id:n.id,type:'news',title:n.title,summary:n.summary,href:'/news/'+n.id,meta:n.tool.name+' · '+(n.publishedAt||'게시일 미확인'),score:relevance(n.title,n.summary+' '+n.tool.name)});
 for(const e of events)results.push({id:e.id,type:'event',title:e.title,summary:e.summary,href:'/news?tab=events#'+e.id,meta:(Date.parse(e.endsAt)<Date.now()?'종료':'예정')+' · '+e.date+' · '+e.timeZone,score:relevance(e.title,e.summary+' '+e.organizer+' '+e.location)});
 let partial=false;
 try{
 const pattern='%'+q.replace(/[\\%_]/g,'\\$&')+'%';
 const posts=await rows<{id:string;title:string;body:string;kind:string;updated_at:string}>("SELECT id,title,body,kind,updated_at FROM posts WHERE status='published' AND kind!='reply' AND (title LIKE ? ESCAPE '\\' OR body LIKE ? ESCAPE '\\') ORDER BY updated_at DESC LIMIT 60",pattern,pattern);
 for(const p of posts)results.push({id:p.id,type:'community',title:p.title,summary:p.body.slice(0,180),href:'/community/'+p.id,meta:'공개 경험 · '+p.updated_at.slice(0,10),score:relevance(p.title,p.body)});
 }catch{partial=true;}
 const found=results.filter(r=>r.score>0).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title));
 const counts=Object.fromEntries(types.map(t=>[t,found.filter(r=>r.type===t).length]));
 return json({results:found.filter(r=>type==='all'||r.type===type),counts,total:found.length,partial});
 }catch(e){return failure(e);}}
