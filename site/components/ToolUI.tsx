'use client';
import Link from '@/components/Link';
import {useState,useEffect} from 'react';
import {type Tool,categories,kindLabels} from '@/lib/catalog';
import {comparableMonthlyPrice,formatUsd,getToolPricing} from '@/lib/tool-pricing';
import {toolGenres,genreLabels} from '@/lib/tool-genres';
import {useApp,api} from './Provider';
import {ArrowUpRight,Plus,Check,Bookmark} from './Icons';
export function ToolLogo({tool,size=42}:{tool:Tool;size?:number}){return <img className="tool-logo" src={'/api/logos/'+tool.id+'?v='+encodeURIComponent(tool.logo)} alt={tool.logoNote||tool.name+' 로고'} width={size} height={size} loading="lazy" decoding="async"/>;}
export function CompareButton({tool,compact=false}:{tool:Tool;compact?:boolean}){const {compare,toggleCompare}=useApp();const selected=compare.includes(tool.id);return <button type="button" className={'button compare-button '+(selected?'selected':'ghost')+(compact?' small':'')} onClick={()=>toggleCompare(tool.id)} aria-pressed={selected} aria-label={tool.name+' 비교 목록에 담기'}><span className="compare-button-icon" key={selected?'selected':'available'} aria-hidden="true">{selected?<Check size={16}/>:<Plus size={16}/>}</span>{compact?(selected?'담김':'비교'):(selected?'비교에 담김':'비교')}</button>;}
export function SaveTool({tool}:{tool:Tool}){const {user,signIn,toast}=useApp(),[busy,setBusy]=useState(false),[saved,setSaved]=useState(false);const save=async()=>{if(!user){sessionStorage.setItem('ais-pending-save',tool.id);signIn('/tools/'+tool.id+'?save=1');return;}setBusy(true);try{await api('/api/workspace',{method:'POST',body:JSON.stringify({action:'save',ifAbsent:true,kind:'library',target:tool.id,payload:{toolId:tool.id,name:tool.name,status:'interested',purpose:'',note:'',collection:'',plan:''}})});setSaved(true);toast('내 도구함에 저장했습니다.');}catch(e){toast((e as Error).message);}finally{setBusy(false);}};useEffect(()=>{if(user&&sessionStorage.getItem('ais-pending-save')===tool.id){sessionStorage.removeItem('ais-pending-save');void save();}},[user,tool.id]);return <button className="button secondary" aria-label={tool.name+' '+(saved?'저장됨':busy?'저장 중':'도구함에 저장')} disabled={busy} onClick={save}>{saved?<Check size={17}/>:<Bookmark size={17}/>} {saved?'저장됨':busy?'저장 중':'도구함에 저장'}</button>;}
export function ToolCard({tool,rank}:{tool:Tool;rank?:number}){
  const pricing=getToolPricing(tool.id),monthly=comparableMonthlyPrice(pricing);
  return <article className="tool-card interaction-tool-card">
    <div className="tool-card-top">
      {rank!=null&&<span className="rank-number">{rank}</span>}
      <ToolLogo tool={tool} size={46}/>
      <div><h3><Link className="tool-name" href={'/tools/'+tool.id}>{tool.name}<ArrowUpRight size={15} aria-hidden="true"/></Link></h3><span className="metadata">{kindLabels[tool.kind]} · {tool.vendor}</span></div>
      <CompareButton tool={tool} compact/>
    </div>
    <p>{tool.summary}</p>
    <div className="tool-card-bottom"><span className="tool-category">{toolGenres(tool).slice(0,2).map(id=>genreLabels[id]).join(' · ')||categories[tool.category]}</span><span>{pricing?<>{pricing.freeTier==='available'?'무료 플랜 있음':pricing.freeTier==='trial'?'일회성 무료 체험':pricing.freeTier==='unavailable'?'유료 구독':'무료 여부 미확인'}{monthly!==null&&<><br/><strong>대표 유료 {formatUsd(monthly)}/인·월</strong></>}</>:tool.pricing}</span></div>
  </article>;
}
