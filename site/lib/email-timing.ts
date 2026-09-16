export type EmailSchedule={mode:'digest'|'matched';timeZone:string;time:string};
type TimingSettings={emailMode?:string;emailTimeZone?:string;emailTime?:string};
const MINUTE=60000,DAY=86400000;
const formats=new Map<string,Intl.DateTimeFormat>();
function formatter(zone:string){
 let f=formats.get(zone);
 if(!f){
  if(zone!=='UTC'&&!/^[A-Za-z_]+(?:\/[A-Za-z0-9_+\-]+)+$/.test(zone))throw new Error('시간대 이름을 확인해주세요.');
  f=new Intl.DateTimeFormat('en-CA-u-ca-gregory-nu-latn',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  if(formats.size>=128)formats.clear();formats.set(zone,f);
 }
 return f;
}
export function emailSchedule(settings:TimingSettings):EmailSchedule{
 const mode=settings.emailMode??'digest',timeZone=settings.emailTimeZone??'Asia/Seoul',time=settings.emailTime??'09:00';
 if(mode!=='digest'&&mode!=='matched')throw new Error('이메일 방식을 확인해주세요.');
 if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('수신 시각은 00:00부터 23:59까지 입력해주세요.');
 return {mode,timeZone:formatter(timeZone).resolvedOptions().timeZone,time};
}
function instant(value:string|number){const n=typeof value==='number'?value:Date.parse(value);if(!Number.isFinite(n))throw new Error('날짜와 시각을 확인해주세요.');return n;}
export function emailLocalParts(value:string|number,timeZone:string){
 const parts=Object.fromEntries(formatter(timeZone).formatToParts(new Date(instant(value))).map(p=>[p.type,p.value]));
 return {date:`${parts.year.padStart(4,'0')}-${parts.month}-${parts.day}`,time:`${parts.hour}:${parts.minute}`,second:parts.second};
}
function dateNumber(date:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('현지 날짜를 확인해주세요.');
 const n=Date.parse(date+'T00:00:00Z');if(!Number.isFinite(n)||new Date(n).toISOString().slice(0,10)!==date)throw new Error('현지 날짜를 확인해주세요.');return n;
}
const followingDate=(date:string)=>new Date(dateNumber(date)+DAY).toISOString().slice(0,10);
export function emailDueOnDate(date:string,schedule:EmailSchedule):string|null{
 dateNumber(date);
 const nominal=Date.parse(date+'T'+schedule.time+':00Z'),offsets=new Set<number>();
 // Sample both sides of a possible transition, then verify every inverse mapping.
 for(let hours=-48;hours<=48;hours+=12){
  const sample=nominal+hours*3600000,p=emailLocalParts(sample,schedule.timeZone);
  offsets.add(Date.parse(`${p.date}T${p.time}:${p.second}Z`)-sample);
 }
 const candidates=[...offsets].map(offset=>nominal-offset).sort((a,b)=>a-b);
 for(const candidate of candidates){const p=emailLocalParts(candidate,schedule.timeZone);if(p.date===date&&p.time===schedule.time&&p.second==='00')return new Date(candidate).toISOString();}
 // A gap has no exact inverse. Pick its first valid later minute on the same date.
 // A wholly skipped local date has none. Normal and folded times never scan here.
 for(let candidate=Math.ceil(candidates[0]/MINUTE)*MINUTE;candidate<=candidates.at(-1)!;candidate+=MINUTE){
  const p=emailLocalParts(candidate,schedule.timeZone);if(p.date===date&&p.time>=schedule.time)return new Date(candidate).toISOString();
 }
 return null;
}
function nextDue(date:string,schedule:EmailSchedule){
 for(let i=0;i<8;i++){date=followingDate(date);const due=emailDueOnDate(date,schedule);if(due)return due;}
 throw new Error('다음 수신 가능 날짜를 계산할 수 없습니다.');
}
export function emailWindow(value:string|number,schedule:EmailSchedule,nextDigestNotBefore?:string|null){
 const current=instant(value),today=emailLocalParts(current,schedule.timeZone).date;
 const guard=schedule.mode==='digest'&&nextDigestNotBefore?instant(nextDigestNotBefore):0;
 let date=today;
 if(guard>current){const guardedDate=emailLocalParts(guard,schedule.timeZone).date;if(guardedDate>date)date=guardedDate;}
 for(let i=0;i<8;i++,date=followingDate(date)){
  const due=emailDueOnDate(date,schedule);if(!due)continue;
  const earliest=Math.max(instant(due),guard);
  if(emailLocalParts(earliest,schedule.timeZone).date!==date)continue;
  return {localDate:date,dueAt:due,eligible:date===today&&current>=earliest,nextEligibleAt:new Date(earliest).toISOString(),nextDigestNotBefore:nextDue(date,schedule)};
 }
 throw new Error('수신 가능 시각을 계산할 수 없습니다.');
}
