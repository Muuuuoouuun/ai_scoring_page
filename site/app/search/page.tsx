import GlobalSearch from '@/components/GlobalSearch';
export default async function Page({searchParams}:{searchParams:Promise<{q?:string;type?:string}>}){const p=await searchParams;return <main id="main" className="container page"><GlobalSearch initialQuery={p.q} initialType={p.type}/></main>;}
