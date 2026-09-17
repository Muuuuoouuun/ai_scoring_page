'use client';
import {useState} from 'react';
import {catalog,findTool,similarTools} from '@/lib/catalog';
import {deadlineState,offerHolds,type Promotion} from '@/lib/promotion-facts';
import promotions from '@/data/promotions.json';
import {ToolLogo} from './ToolUI';
import type {PrivateRecord} from './RecordForm';
import {ArrowUpRight,Plus} from './Icons';

export default function ServiceInsights({records,onEdit,onAddSubscription}:{records:PrivateRecord[];onEdit:(record:PrivateRecord)=>void;onAddSubscription:(toolId:string)=>void}){
 const services=records.filter(r=>r.kind==='library'||r.kind==='subscription').filter((r,i,a)=>!r.payload.toolId||a.findIndex(x=>x.payload.toolId===r.payload.toolId)===i);
 const [selected,setSelected]=useState('');
 const record=services.find(r=>r.id===selected)||services[0];
 if(!record)return null;
 const tool=findTool(record.payload.toolId),subscriptions=tool?records.filter(r=>r.kind==='subscription'&&r.payload.toolId===tool.id):record.kind==='subscription'?[record]:[];
 const alternatives=tool?similarTools(tool,catalog):[];
 const settings=records.find(r=>r.kind==='settings')?.payload||{};
 const offers=tool?(promotions as Promotion[]).filter(p=>p.status==='active'&&deadlineState(p)!=='expired'&&(p.toolId===tool.id||alternatives.some(a=>a.tool.id===p.toolId))):[];
 return <section className="service-insights" aria-labelledby="service-insights-title">
  <div className="section-heading"><h3 id="service-insights-title">서비스 한눈에 보기</h3><label className="service-switch">서비스 선택<select value={record.id} onChange={e=>setSelected(e.target.value)}>{services.map(r=><option key={r.id} value={r.id}>{r.payload.name}</option>)}</select></label></div>
  {tool?<>
   <div className="similar-source"><ToolLogo tool={tool} size={40}/><div><a className="tool-name" href={'/tools/'+tool.id}>{tool.name}<ArrowUpRight size={14}/></a><p>{tool.summary}</p></div><a className="text-link" href={tool.homepage} target="_blank" rel="noreferrer">서비스 열기<ArrowUpRight size={14}/></a></div>
   <p className="metadata">공식 정보와 내 기록을 연결했습니다. 외부 계정·결제 내역의 자동 연동 상태는 아닙니다.</p>
   <div className="service-insight-grid">
    <section><h4>연결된 구독 {subscriptions.length}개</h4>{subscriptions.length?subscriptions.map(s=><p key={s.id}>{s.payload.plan||'요금제 미입력'} · 다음 결제 {s.payload.nextDate||'미확인'}<button className="button ghost small" onClick={()=>onEdit(s)} aria-label={s.payload.name+' 구독 기록 수정'}>기록 보기</button></p>):<p>이 서비스의 구독 기록이 없습니다.</p>}<button className="text-link plain-link" onClick={()=>onAddSubscription(tool.id)}><Plus size={14}/>구독 기록 연결</button></section>
    <section><h4>공식 업데이트</h4><a className="service-update" href={'/news/'+tool.id}>{tool.latestUpdate.title}</a><p className="metadata">{tool.latestUpdate.publishedAt?'발표 '+tool.latestUpdate.publishedAt:'발표일 미확인'} · 출처 확인 {tool.checkedAt}</p></section>
    <section><h4>공통 기능이 있는 대안</h4>{alternatives.length?<><p>{alternatives.slice(0,3).map(a=>a.tool.name).join(' · ')}</p><a className="text-link" href={'/recommend?similar='+tool.id}>기능과 조건 비교<ArrowUpRight size={14}/></a></>:<p>등록된 기능에서 연결할 대안을 찾지 못했습니다.</p>}</section>
   </div>
   <section className="service-offers"><div className="section-heading"><h4>연결된 혜택 {offers.length}개</h4><a className="text-link" href="/promotions">전체 혜택<ArrowUpRight size={14}/></a></div>{offers.length?offers.map(p=>{const holds=offerHolds(p,settings),ineligible=settings.promotionEligibility?.[p.id]==='ineligible';return <article key={p.id}><div><a href={'/promotions#'+p.id}>{p.name}</a><p>{p.toolId===tool.id?'등록한 서비스의 혜택':'공통 기능이 있는 대안의 혜택'} · {p.region}</p></div><span title={holds.join(' · ')} className={'badge '+(ineligible?'':holds.length?'yellow':'green')}>{ineligible?'내 설정: 해당하지 않음':holds.length?'조건 확인 필요':'입력 조건 일치'}</span></article>}):<p>현재 검수한 자료에서 관련 혜택을 찾지 못했습니다. 새로운 혜택이 없다는 뜻은 아닙니다.</p>}</section>
  </>:<div className="service-unlinked"><h4>{record.payload.name}</h4><p>등록된 카탈로그와 연결하면 공식 기능·업데이트와 관련 혜택을 함께 확인할 수 있습니다.</p><button className="button secondary small" onClick={()=>onEdit(record)}>서비스 정보 연결</button></div>}
 </section>;
}
