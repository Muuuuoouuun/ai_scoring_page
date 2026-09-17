import { authenticated,input,json,failure,ApiError } from '@/lib/http';
import { one,db,id,now } from '@/lib/db';
import { z } from 'zod';
export async function POST(request:Request){try{const u=await authenticated(),p=await input(request,z.object({action:z.enum(['helpful','report']),postId:z.string().uuid(),reason:z.string().trim().max(1000).optional()}));
  if(!await one("SELECT id FROM posts WHERE id=? AND status='published'",p.postId))throw new ApiError(404,'글을 찾을 수 없습니다.');
  if(p.action==='report'){if(!p.reason?.trim())throw new ApiError(400,'신고 이유를 입력해주세요.');await db().prepare('INSERT INTO reports(id,user_id,target_id,reason,status,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id,target_id) DO UPDATE SET reason=excluded.reason').bind(id(),u.userId,p.postId,p.reason,'received',now()).run();return json({received:true});}
  const old=await one<{id:string}>('SELECT id FROM reactions WHERE user_id=? AND post_id=?',u.userId,p.postId);
  if(old)await db().prepare('DELETE FROM reactions WHERE id=? AND user_id=?').bind(old.id,u.userId).run();else await db().prepare('INSERT INTO reactions(id,user_id,post_id,created_at) VALUES(?,?,?,?)').bind(id(),u.userId,p.postId,now()).run();
  return json({helpful:!old});
}catch(e){return failure(e);}}
