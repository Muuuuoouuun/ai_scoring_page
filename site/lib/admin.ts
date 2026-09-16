import {env} from 'cloudflare:workers';
import {authenticated,ApiError} from './http';
export async function requireAdmin(){const u=await authenticated(),e=env as unknown as Record<string,string>;if(!e.ADMIN_USER_IDS?.split(',').map(s=>s.trim()).includes(u.userId))throw new ApiError(403,'운영 권한이 필요합니다.');return u;}
