import Explore from '@/components/Explore';
export default async function Page({searchParams}:{searchParams:Promise<{q?:string;category?:string}>}){const p=await searchParams;return <main id="main" className="container page"><Explore initialQuery={p.q} initialCategory={p.category}/></main>;}
