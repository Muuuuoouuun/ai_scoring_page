import {rows} from './db';
import {hydrateHistories} from './contract-history';
import {catalog,similarTools} from './catalog';
import {today,billingReport,type Contract,type Payment} from './billing';
import promotions from '@/data/promotions.json';
import {fingerprint,promotionMaterial,offerHolds,deadlineState,deadlineLabel,priceLabel,emailDeadline,materialChanges,canonical,type OfferConstraints,type Promotion} from './promotion-facts';
import {registerSource,type SourceIdentity} from './notice-sources';
export type NoticeSettings=OfferConstraints&{interests:string[];includeAlternatives:boolean;inApp:boolean;email:boolean;emailAddress?:string;hiddenTopics?:string[];emailMode?:string;emailTimeZone?:string;emailTime?:string;emailTimingConfirmed?:boolean;emailRevision?:string};
export type Card={id:string;card_key:string;latest_notification_id:string;source_version:string;source_revision:number;snapshot:string;status:string;read:number;created_at:string;legacy_baseline_version:string|null};
type Version={id:string;source_key:string;metadata:string|null;created_at:string;attempts:number|null};
export type Notice=SourceIdentity&{key:string;topic:string;title:string;body:string;href:string;emailAllowed:boolean;material:Record<string,unknown>;status:string;holds:string[];prior?:Card;legacyId?:string;legacyBaseline:string|null;retainedOnly:boolean;headValid:boolean;personalRecord?:{id:string;payload:string};emailNotAfter:string|null;correctionBaseline:Record<string,unknown>|null};
export async function currentNotices(userId:string){
 const records=await rows<{kind:string;id:string;payload:string}>("SELECT id,kind,payload FROM private_records WHERE user_id=? AND (kind IN ('subscription','payment') OR (kind='settings' AND target='preferences'))",userId);
 const setting=records.find(r=>r.kind==='settings');
 const s:NoticeSettings=setting?JSON.parse(setting.payload):{interests:[],includeAlternatives:false,inApp:true,email:false};
 const cards=await rows<Card>('SELECT * FROM notification_cards WHERE user_id=?',userId);
 const versions=await rows<Version>('SELECT n.id,n.source_key,n.metadata,n.created_at,o.attempts FROM notifications n LEFT JOIN email_outbox o ON o.notification_id=n.id AND o.user_id=n.user_id WHERE n.user_id=? ORDER BY n.created_at,n.id',userId);
 const notices:Notice[]=[];
 async function candidate(input:{cardKey:string;topic:string;revision:number;title:string;body:string;href:string;material:Record<string,unknown>;holds:string[];status:string;retainedOnly?:boolean;legacyPrefix?:string;promotion?:Promotion;interested?:boolean;personalRecord?:{id:string;payload:string}}){
  const version=await fingerprint(input.material),identity={cardKey:input.cardKey,version,revision:input.revision};
  const head=input.cardKey.startsWith('billing:')?{valid:true,eventRevision:1}:await registerSource(identity),headValid=Boolean(head.valid),prior=cards.find(c=>c.card_key===input.cardKey);
  const legacy=versions.filter(v=>!v.metadata&&v.source_key.startsWith(input.legacyPrefix||input.topic+':'));
  const history=versions.filter(v=>{if(!v.metadata)return legacy.includes(v);try{return JSON.parse(v.metadata).cardKey===input.cardKey;}catch{return false;}});
  const attempted=history.filter(v=>(v.attempts||0)>0),old=prior?JSON.parse(prior.snapshot):null;
  const same=prior?.source_version===version,currentStored=history.find(v=>v.id===prior?.latest_notification_id);
  const key=input.cardKey.startsWith('billing:')?input.cardKey:same&&currentStored?currentStored.source_key:input.cardKey+':r'+head.eventRevision+':'+version;
  const legacyBaseline=prior?.legacy_baseline_version||(!prior&&legacy.some(v=>(v.attempts||0)>0)?key:null);
  const storedMetadata=currentStored?.metadata?JSON.parse(currentStored.metadata):null;
  const lastAttempt=attempted.filter(v=>v.metadata&&v.source_key!==key).at(-1);
  const baseline=same?storedMetadata?.correctionBaseline||null:lastAttempt?.metadata?JSON.parse(lastAttempt.metadata).material:old;
  const changed=baseline?materialChanges(baseline,input.material):[];
  const relevant=changed.some(k=>k!=='features')||changed.includes('features')&&(!(s.neededFeatures?.length)||s.neededFeatures.some(id=>{
   const find=(x:Record<string,unknown>)=>(x.features as {id:string}[]||[]).find(f=>f.id===id);return canonical(find(baseline))!==canonical(find(input.material));
  }));
  const correction=Boolean(input.promotion&&baseline&&attempted.length&&relevant&&legacyBaseline!==key);
  const unrelatedChange=Boolean(input.promotion&&baseline&&attempted.length&&changed.length&&!relevant);
  const holds=[...input.holds];if(!headValid)holds.push('출처 버전 충돌 또는 이전 자료 · 재검토 필요');
  if(legacyBaseline===key)holds.push('이전 안내 내용 미확인 · 새 기준 버전 이메일 보류');
  if(unrelatedChange)holds.push('선택한 필수 기능에 영향 없는 변경');
  if(input.interested===false)holds.push('관심 서비스 수신 해제');
  const expiredSnapshot=Boolean(same&&storedMetadata?.emailNotAfter&&storedMetadata.emailNotAfter<=new Date().toISOString());
  if(expiredSnapshot)holds.push('안내 작성 후 등록 마감 경과 · 기존 안내 재발송 보류');
  const ongoingSourceValid=!input.promotion||input.promotion.deadlineType!=='ongoing'||deadlineState(input.promotion)==='open';
  const emailAllowed=ongoingSourceValid&&!expiredSnapshot&&headValid&&input.interested!==false&&!unrelatedChange&&legacyBaseline!==key&&(correction?input.promotion?.reviewStatus==='verified':holds.length===0);
  const emailNotAfter=input.promotion&&(deadlineState(input.promotion)==='open'||!correction)?emailDeadline(input.promotion):null;

  const status=input.status!=='current'?input.status:correction?'corrected':prior&&!same?'updated':prior?.status||'current';
  notices.push({...identity,key,personalRecord:input.personalRecord,topic:input.topic,title:(correction?'정정 · ':'')+input.title,body:(correction?'기존 혜택 안내의 조건이 변경되었습니다. ':'')+input.body,href:input.href,emailAllowed,emailNotAfter,correctionBaseline:baseline,material:input.material,status,holds,prior,legacyId:!prior?legacy[0]?.id:undefined,legacyBaseline,retainedOnly:input.retainedOnly||false,headValid});
 }
 for(const t of catalog.filter(t=>s.interests.includes(t.id))){
  const u=t.latestUpdate,announcement=u.id||t.id+'-'+(u.publishedAt||'undated-1');
  await candidate({cardKey:'update:'+t.id+':'+announcement,topic:'update:'+t.id,revision:u.revision||1,title:t.name+' 업데이트',body:u.title+' · '+u.summary,href:'/news/'+t.id,material:{title:u.title,summary:u.summary,publishedAt:u.publishedAt,sourceUrl:u.sourceUrl,audience:u.audience||null,rollout:u.rollout||null},holds:[],status:'current',legacyPrefix:'update:'+t.id+':'+(u.publishedAt||t.checkedAt)});
 }
 const chosen=catalog.filter(t=>s.interests.includes(t.id));
 for(const p of promotions as Promotion[]){
  const tool=catalog.find(t=>t.id===p.toolId),direct=s.interests.includes(p.toolId);
  const alternative=s.includeAlternatives&&tool&&chosen.some(t=>similarTools(t,[tool]).length>0);
  const interested=Boolean(direct||alternative);
  if(!interested&&!cards.some(c=>c.card_key==='promotion:'+p.id)&&!versions.some(v=>v.source_key.startsWith('promotion:'+p.id+':')))continue;
  const deadline=deadlineState(p),holds=offerHolds(p,s);
  const status=p.status==='withdrawn'?'withdrawn':p.status!=='active'||deadline==='expired'?'expired':'current';
  await candidate({cardKey:'promotion:'+p.id,topic:'promotion:'+p.id,revision:p.revision||1,title:p.name,body:p.summary+' · '+(direct?'관심 서비스':'관심 도구와 공통 기능이 있는 대안')+' · 대상: '+p.region+' · '+deadlineLabel(p)+' · 혜택 '+priceLabel(p.price)+' · 갱신 '+(p.renewalNote||priceLabel(p.renewalPrice))+' · '+p.benefitDuration+(holds.length?' · '+holds.join(' · '):' · 입력한 조건과 일치 · 신청 시 공식 재확인 필요'),href:'/promotions#'+p.id,material:promotionMaterial(p),holds,status,retainedOnly:!interested||status!=='current'||s.promotionEligibility?.[p.id]==='ineligible',promotion:p,interested});
 }
 const week=new Date();week.setUTCDate(week.getUTCDate()+7);
 const hydrated=await hydrateHistories(userId,records.filter(r=>r.kind==='subscription').map(r=>({...r,payload:JSON.parse(r.payload)})));
 const contracts=hydrated.map(r=>({id:r.id,...r.payload})),payments=records.filter(r=>r.kind==='payment').map(r=>({id:r.id,...JSON.parse(r.payload)}));
 const summary=billingReport(contracts as Contract[],payments as Payment[],today(),week.toISOString().slice(0,10));
 for(const due of summary.schedule.filter(d=>d.state==='expected')){const p=contracts.find(c=>c.id===due.contractId);await candidate({cardKey:'billing:'+due.contractId+':'+due.date,topic:'billing:'+due.contractId,revision:1,title:p.name+' 결제 예정',body:due.date+' 결제 예정입니다. 해지 신청 여부와 실제 청구 조건을 확인하세요.',href:'/my?tab=subscription',material:{date:due.date,contractId:due.contractId},holds:['앱에서 확인하는 결제 알림'],status:'current',personalRecord:records.find(r=>r.id===due.contractId)});}
 return {settingsId:setting?.id,settingsRevision:s.emailRevision||'',settings:s,notices:notices.filter(n=>!s.hiddenTopics?.includes(n.topic))};
}
