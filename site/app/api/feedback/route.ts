import {z} from 'zod';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {input,json,failure,ApiError} from '@/lib/http';
import {feedbackScopes,feedbackAnswers,feedbackContexts} from '@/lib/feedback-config';
import {feedbackRecord} from '@/lib/feedback';
const common={session:z.string().uuid(),scope:z.enum(feedbackScopes)};
const schema=z.discriminatedUnion('action',[
 z.object({...common,action:z.literal('start'),context:z.enum(feedbackContexts)}).strict(),
 z.object({...common,action:z.literal('answer'),answer:z.enum(feedbackAnswers),comment:z.string().max(1000).transform(s=>s.trim()).optional()}).strict(),
 z.object({...common,action:z.literal('delete')}).strict(),
]);
export async function POST(request:Request){try{const p=await input(request,schema),user=await getChatGPTUser();if(p.scope==='personal'&&!user)throw new ApiError(401,'개인 관리 의견은 로그인 후 남길 수 있습니다.');return json(await feedbackRecord(user?.userId??null,p));}catch(e){return failure(e);}}
