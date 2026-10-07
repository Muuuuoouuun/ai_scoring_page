import Link from '@/components/Link';
import ToolComparison from '@/components/ToolComparison';
import {ArrowRight} from '@/components/Icons';
import {catalog,type Tool} from '@/lib/catalog';
import '../tool-comparison.css';

export default async function Page({searchParams}:{searchParams:Promise<{ids?:string}>}){
 const {ids=''}=await searchParams;
 const tools=[...new Set(ids.split(','))].slice(0,3)
  .map(id=>catalog.find(t=>t.id===id)).filter((tool):tool is Tool=>Boolean(tool));

 return <main className="container page tool-comparison" id="main">
  <div className="page-title">
   <div><span className="eyebrow">Side by side</span><h1>도구 비교</h1><p>업무·요금·이용 환경을 비교하고, 각 서비스의 기능과 조건을 확인하세요.</p></div>
   <Link className="button secondary" href="/explore">비교할 도구 선택<ArrowRight size={16}/></Link>
  </div>
  {tools.length===0?<div className="empty">
   <h2>비교할 도구를 골라보세요.</h2>
   <p>탐색 화면에서 비교에 담으면 최대 3개의 도구를 같은 기준으로 살펴볼 수 있습니다.</p>
   <Link className="button primary" href="/explore">도구 탐색<ArrowRight size={16}/></Link>
  </div>:<ToolComparison tools={tools}/>}
 </main>;
}
