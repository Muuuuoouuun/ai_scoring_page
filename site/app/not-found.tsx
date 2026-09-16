import Link from '@/components/Link';
export default function NotFound(){return <main className="container page" id="main"><div className="empty"><span className="eyebrow">404</span><h1>페이지를 찾을 수 없습니다.</h1><p style={{marginTop:15}}>주소가 바뀌었거나 삭제된 콘텐츠입니다.</p><Link className="button primary" href="/explore">도구 탐색으로</Link></div></main>;}
