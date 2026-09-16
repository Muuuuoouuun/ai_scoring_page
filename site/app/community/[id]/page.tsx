import Community from '@/components/Community';
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{write?:string}>}){const [{id},{write}]=await Promise.all([params,searchParams]);return <main className="container page reading-width" id="main"><Community threadId={id} write={write}/></main>;}
