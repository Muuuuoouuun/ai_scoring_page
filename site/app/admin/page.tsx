import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import Admin from '@/components/Admin';
export default async function Page(){const u=await getChatGPTUser(),e=env as unknown as Record<string,string>,allowed=u&&e.ADMIN_USER_IDS?.split(',').includes(u.userId);return <main className="container page reading-width" id="main"><div className="page-title"><div><h1>운영 관리</h1><p>신고·기능 제안과 동기화 상태를 확인합니다.</p></div></div>{allowed?<Admin/>:<div className="empty"><h3>운영 권한이 필요합니다.</h3><p>운영자로 지정된 계정만 이용할 수 있습니다.</p>{u&&!e.ADMIN_USER_IDS&&<p className="note">운영 계정을 연결하려면 사이트 소유자가 이 계정을 지정해야 합니다.<br/>현재 계정 식별자: <code>{u.userId}</code></p>}</div>}</main>;}
