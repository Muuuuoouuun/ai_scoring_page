import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {json} from '@/lib/http';
export async function GET(){const e=env as unknown as Record<string,string>,u=await getChatGPTUser();return json({emailConfigured:!!(e.RESEND_API_KEY&&e.EMAIL_FROM&&e.SITE_URL),admin:!!u&&!!e.ADMIN_USER_IDS?.split(',').includes(u.userId)});}
