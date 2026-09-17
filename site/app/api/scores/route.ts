import {rows} from '@/lib/db';
import {json,failure} from '@/lib/http';
import {findTool} from '@/lib/catalog';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const u=new URL(request.url),tool=u.searchParams.get('tool')||'',task=u.searchParams.get('task')||'',plan=u.searchParams.get('plan')||'';if(!findTool(tool))return json({error:'도구를 찾을 수 없습니다.'},404);
// One latest published review per account and tool. Filtering happens after deduplication.
const reviews=await rows<{task:string;plan:string;ratings:string|null;used_at:string;updated_at:string}>("SELECT p.task,p.plan,p.ratings,p.used_at,p.updated_at FROM posts p WHERE p.kind='review' AND p.status='published' AND p.tool_id=? AND NOT EXISTS (SELECT 1 FROM posts n WHERE n.user_id=p.user_id AND n.tool_id=p.tool_id AND n.kind='review' AND n.status='published' AND (n.updated_at>p.updated_at OR (n.updated_at=p.updated_at AND n.id>p.id)))",tool);
const sample=reviews.filter(r=>(!task||r.task===task)&&(!plan||r.plan===plan));const axes:Record<string,{sum:number;count:number}>={};for(const r of sample){if(!r.ratings)continue;for(const [key,value] of Object.entries(JSON.parse(r.ratings))){if(typeof value!=='number')continue;const a=axes[key]??={sum:0,count:0};a.sum+=value;a.count++;}}
return json({axes:Object.fromEntries(Object.entries(axes).map(([k,a])=>[k,{value:Math.round(a.sum/a.count*10)/10,count:a.count}])),sample:sample.length,tasks:[...new Set(reviews.map(r=>r.task))],plans:[...new Set(reviews.map(r=>r.plan))],latest:sample.map(r=>r.updated_at).sort().at(-1)||null});}catch(e){return failure(e);}}
