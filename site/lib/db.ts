import { env } from 'cloudflare:workers';
export function db(): D1Database {
  if(!env.DB) throw new Error('기록 저장소에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
  return env.DB;
}
export async function rows<T=Record<string,unknown>>(sql:string,...params:unknown[]) { return (await db().prepare(sql).bind(...params).all<T>()).results; }
export async function one<T=Record<string,unknown>>(sql:string,...params:unknown[]) { return db().prepare(sql).bind(...params).first<T>(); }
export const now=()=>new Date().toISOString();
export const id=()=>crypto.randomUUID();
