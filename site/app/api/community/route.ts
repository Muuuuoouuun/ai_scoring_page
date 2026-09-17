import { getChatGPTUser } from '@/app/chatgpt-auth';
import { authenticated,input,json,failure,ApiError } from '@/lib/http';
import { rows,one,db,id,now } from '@/lib/db';
import { postSchema } from '@/lib/validation';
import { findTool } from '@/lib/catalog';
import { z } from 'zod';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{
  const user=await getChatGPTUser(),url=new URL(request.url),tool=url.searchParams.get('tool'),parent=url.searchParams.get('parent'),kind=url.searchParams.get('kind');
  let sql="SELECT p.*, (SELECT COUNT(*) FROM reactions r WHERE r.post_id=p.id) helpful, (SELECT COUNT(*) FROM posts c WHERE c.parent_id=p.id AND c.status='published') replies FROM posts p WHERE p.status='published'",args:unknown[]=[];
  if(tool){sql+=' AND p.tool_id=?';args.push(tool);}if(parent){sql+=' AND p.parent_id=?';args.push(parent);}else{sql+=' AND p.parent_id IS NULL';}if(kind){sql+=' AND p.kind=?';args.push(kind);}
  sql+=' ORDER BY p.created_at DESC LIMIT 100';
  const postId=url.searchParams.get('id');if(postId){sql="SELECT p.*, (SELECT COUNT(*) FROM reactions r WHERE r.post_id=p.id) helpful, (SELECT COUNT(*) FROM posts c WHERE c.parent_id=p.id AND c.status='published') replies FROM posts p WHERE p.id=? AND p.status='published'";args=[postId];}
  const result=await rows<Record<string,unknown>>(sql,...args);
  return json({posts:result.map(({user_id,ratings,...p})=>({...p,mine:user_id===user?.userId,ratings:ratings?JSON.parse(String(ratings)):null}))});
}catch(e){return failure(e);}}
export async function POST(request:Request){try{
  const user=await authenticated(),p=await input(request,postSchema),stamp=now();
  if(p.kind==='review'&&!p.toolId)throw new ApiError(400,'평가할 도구를 선택해주세요.');
  if(p.toolId&&!findTool(p.toolId))throw new ApiError(400,'도구를 확인해주세요.');
  const recent=await one<{count:number}>('SELECT COUNT(*) count FROM posts WHERE user_id=? AND created_at>?',user.userId,new Date(Date.now()-60000).toISOString());
  if((recent?.count??0)>=5)throw new ApiError(429,'잠시 후 다시 작성해주세요.');
  if(p.parentId){const parent=await one("SELECT id FROM posts WHERE id=? AND status='published'",p.parentId);if(!parent)throw new ApiError(404,'원문을 찾을 수 없습니다.');}
  if(p.id){const old=await one<{kind:string;tool_id:string|null;parent_id:string|null}>("SELECT kind,tool_id,parent_id FROM posts WHERE id=? AND user_id=? AND status='published'",p.id,user.userId);if(!old)throw new ApiError(404,'수정할 글을 찾을 수 없습니다.');if(old.kind!==p.kind||old.tool_id!==(p.toolId||null)||old.parent_id!==(p.parentId||null))throw new ApiError(400,'글 종류와 대상을 변경할 수 없습니다.');await db().prepare('UPDATE posts SET author=?,title=?,body=?,task=?,plan=?,used_at=?,affiliation=?,ratings=?,updated_at=? WHERE id=? AND user_id=?').bind(p.author,p.title,p.body,p.task,p.plan,p.usedAt||null,p.affiliation,p.ratings?JSON.stringify(p.ratings):null,stamp,p.id,user.userId).run();return json({id:p.id});}
  const postId=id();await db().prepare('INSERT INTO posts(id,user_id,author,kind,tool_id,parent_id,title,body,task,plan,used_at,affiliation,ratings,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(postId,user.userId,p.author,p.kind,p.toolId||null,p.parentId||null,p.title,p.body,p.task,p.plan,p.usedAt||null,p.affiliation,p.ratings?JSON.stringify(p.ratings):null,'published',stamp,stamp).run();
  return json({id:postId},201);
}catch(e){return failure(e);}}
export async function DELETE(request:Request){try{const u=await authenticated(),p=await input(request,z.object({id:z.string().uuid()}));const result=await db().prepare("UPDATE posts SET status='deleted',body='',title='삭제된 글',ratings=NULL WHERE id=? AND user_id=?").bind(p.id,u.userId).run();if(!result.meta.changes)throw new ApiError(404,'글을 찾을 수 없습니다.');return json({deleted:true});}catch(e){return failure(e);}}
