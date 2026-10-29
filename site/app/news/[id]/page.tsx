import Link from '@/components/Link';
import {notFound} from 'next/navigation';
import {updates,dateLabel} from '@/lib/content';
import {ToolLogo} from '@/components/ToolUI';
import SaveContent from '@/components/SaveContent';
import ToolEditorial from '@/components/ToolEditorial';
import {ArrowUpRight} from '@/components/Icons';
export default async function Page({params}:{params:Promise<{id:string}>}){
 const {id}=await params,u=updates.find(u=>u.id===id);if(!u)notFound();
 return <main className="container page article" id="main"><div className="breadcrumb"><Link href="/news">소식·행사</Link><span>/</span><span>블로그·공지</span></div><div className="actions"><ToolLogo tool={u.tool} size={40}/><span>{u.tool.name}</span><span className="badge">공식 출처 요약</span></div><h1>{u.tool.name} 블로그·공지</h1><p className="article-intro">주요 기능과 최근 확인한 업데이트를 짧게 정리했습니다.</p><p className="metadata">내용 확인 {dateLabel(u.checkedAt||u.tool.checkedAt)} · 공식 문서 기반</p><div className="line-section"><ToolEditorial tool={u.tool}/></div><div className="actions line-section"><Link className="button secondary" href={'/tools/'+u.id}>{u.tool.name} 기능·평가<ArrowUpRight size={15}/></Link><SaveContent type="news" target={u.id} title={u.title}/></div></main>;
}
