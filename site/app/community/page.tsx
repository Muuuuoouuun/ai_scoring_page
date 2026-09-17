import Community from '@/components/Community';
export default async function Page({searchParams}:{searchParams:Promise<{tool?:string;write?:string}>}){const p=await searchParams;return <main className="container page reading-width" id="main"><Community tool={p.tool} write={p.write}/></main>;}
