import Recommend from '@/components/Recommend';
export default async function Page({searchParams}:{searchParams:Promise<{similar?:string}>}){const p=await searchParams;return <main id="main" className="container page reading-width"><div className="page-title"><div><h1>업무에 맞는 도구 추천</h1><p>하려는 일과 필수 조건을 기준으로 선택지를 좁혀보세요.</p></div></div><Recommend initialSource={p.similar}/></main>;}
