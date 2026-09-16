'use client';
type Value={emailMode?:string;emailTimeZone?:string;emailTime?:string;email?:boolean;emailTimingConfirmed?:boolean};
export const emailDefaults={emailMode:'digest',emailTimeZone:'Asia/Seoul',emailTime:'09:00'};
export default function EmailPreferences({value,onChange}:{value:Value;onChange:(fields:Partial<Value>)=>void}){
 const v={...emailDefaults,...value};
 return <section style={{marginBottom:24}} aria-labelledby="email-preferences-title">
  <h3 id="email-preferences-title" style={{marginBottom:16}}>이메일 수신 방식</h3>
  <div className="grid-3" style={{gap:16}}>
   <label className="field">수신 방식<select value={v.emailMode} onChange={e=>onChange({emailMode:e.target.value})}><option value="digest">하루 요약</option><option value="matched">조건 알림</option></select></label>
   <label className="field">시간대<input required list="email-time-zones" value={v.emailTimeZone} maxLength={100} onChange={e=>onChange({emailTimeZone:e.target.value})} aria-describedby="email-zone-help"/><datalist id="email-time-zones"><option value="Asia/Seoul"/><option value="Asia/Tokyo"/><option value="America/New_York"/><option value="America/Los_Angeles"/><option value="Europe/London"/><option value="UTC"/></datalist><small id="email-zone-help">지역 시간대 이름 · 예: Asia/Seoul</small></label>
   <label className="field">{v.emailMode==='matched'?'하루 처리 시작 시각':'요약 기준 시각'}<input type="time" required step={60} value={v.emailTime} onInput={e=>onChange({emailTime:e.currentTarget.value})} onChange={e=>onChange({emailTime:e.target.value})}/></label>
  </div>
  <p className="note">{v.emailMode==='matched'?'지정 시각 이후 새로 확인한 항목을 모아 처리합니다. 최근 24시간 최대 3회이며, 초과 항목은 다음 가능한 확인 때 다시 검토합니다.':'지정 시각 이후 첫 확인 때 새 항목을 한 번 모아 처리합니다. 항목이 없으면 보내지 않으며, 이후 추가된 항목은 다음 날 요약 대상입니다.'}</p>
  {value.email&&!value.emailTimingConfirmed&&<p className="note warning" style={{marginTop:12}}>이전 설정의 수신 시각을 확인해야 합니다. 위 방식·시간대·시각을 확인하고 저장하면 이메일 처리 대상이 됩니다.</p>}
  <p className="metadata" style={{marginTop:12}}>현재는 알림 화면을 열거나 ‘새로 확인’을 누를 때 처리합니다. 화면을 열지 않아도 실행되는 예약 발송은 아직 연결되지 않았습니다. 시간 설정은 이메일 수신을 켜지 않고도 저장할 수 있습니다.</p>
 </section>;
}
