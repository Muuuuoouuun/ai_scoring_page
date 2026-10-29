import {rows} from '@/lib/db';
import {json,failure} from '@/lib/http';
import {findTool} from '@/lib/catalog';
import {aggregateReviewScores,type ReviewScoreRow} from '@/lib/review-scores';

export const dynamic='force-dynamic';
export async function GET(request:Request){
  try{
    const url=new URL(request.url);
    const tool=url.searchParams.get('tool')||'';
    const task=url.searchParams.get('task')||'';
    const plan=url.searchParams.get('plan')||'';
    if(!findTool(tool))return json({error:'도구를 찾을 수 없습니다.'},404);

    // One latest published review per account and tool, before task/plan filtering.
    const reviews=await rows<ReviewScoreRow>(`
      SELECT p.id,p.title,p.task,p.plan,p.ratings,p.used_at,p.updated_at
      FROM posts p
      WHERE p.kind='review' AND p.status='published' AND p.tool_id=?
        AND NOT EXISTS (
          SELECT 1 FROM posts n
          WHERE n.user_id=p.user_id AND n.tool_id=p.tool_id
            AND n.kind='review' AND n.status='published'
            AND (n.updated_at>p.updated_at OR (n.updated_at=p.updated_at AND n.id>p.id))
        )`,tool);
    return json(aggregateReviewScores(reviews,{task,plan}));
  }catch(error){return failure(error);}
}
