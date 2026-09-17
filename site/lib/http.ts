import { getChatGPTUser } from '@/app/chatgpt-auth';
import { z } from 'zod';
export class ApiError extends Error { constructor(public status:number,message:string){super(message);} }
export async function authenticated(){const user=await getChatGPTUser();if(!user)throw new ApiError(401,'로그인 후 이용할 수 있습니다.');return user;}
export function enforceOrigin(request:Request){
  if(request.headers.get('sec-fetch-site')==='cross-site')throw new ApiError(403,'허용되지 않은 요청입니다.');
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)throw new ApiError(403,'허용되지 않은 요청입니다.');
  if(!request.headers.get('content-type')?.includes('application/json'))throw new ApiError(415,'JSON 요청이 필요합니다.');
}
export async function input<T>(request:Request,schema:z.ZodType<T>){
  enforceOrigin(request);
  if(Number(request.headers.get('content-length'))>65536)throw new ApiError(413,'입력이 너무 깁니다.');
  const reader=request.body?.getReader();const chunks:Uint8Array[]=[];let size=0;if(reader){try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536)throw new ApiError(413,'입력이 너무 깁니다.');chunks.push(value);}}finally{await reader.cancel();}}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}const body=new TextDecoder().decode(bytes);
  let value;try{value=JSON.parse(body);}catch{throw new ApiError(400,'입력 형식을 확인해주세요.');}
  const result=schema.safeParse(value);if(!result.success)throw new ApiError(400,result.error.issues[0]?.message||'입력을 확인해주세요.');return result.data;
}
export function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
export function failure(error:unknown){if(error instanceof ApiError)return json({error:error.message},error.status);console.error('AIs request failed',error instanceof Error?error.message:'unknown');return json({error:'처리하지 못했습니다. 입력을 유지한 채 다시 시도해주세요.'},503);}
