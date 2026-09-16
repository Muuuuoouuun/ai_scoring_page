'use client';
import type {EmailStatus} from '@/lib/email-status';
const statuses:Record<string,string>={prepared:'발송 준비',sending:'전송 처리 중',accepted:'제공사 접수',retryable:'재시도 대기',needs_review:'확인 필요',cancelled:'취소'};
function date(value:string,zone:string){return new Intl.DateTimeFormat('ko-KR',{timeZone:zone,month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));}
export default function EmailDeliveryStatus({status}:{status:EmailStatus}){
 const descriptions:Record<string,string>={transport_unconfigured:'이메일 발송 연결 준비 중',off:'이메일 수신 꺼짐',timing_required:'수신 시각 확인 필요',processing:'전송 처리 중',ready:'다음 새로 확인 때 처리 가능',waiting:'설정한 수신 시간까지 대기',quota_wait:'최근 24시간 발송 한도로 대기',retry_wait:'같은 발송 건의 재시도 대기'};
 return <section className="panel" style={{marginBottom:24}} aria-labelledby="email-status-title">
  <div className="section-heading" style={{marginBottom:12}}><h3 id="email-status-title">이메일 처리 상태</h3><a className="text-link" href="/my?tab=settings">수신 설정</a></div>
  <p>{descriptions[status.state]||'처리 상태 확인 중'}</p>
  {status.nextEligibleAt&&!['ready','processing'].includes(status.state)&&<p className="metadata" style={{marginTop:8}}>다음 확인 가능: {date(status.nextEligibleAt,status.timeZone)} · {status.timeZone}</p>}
  <p className="metadata" style={{marginTop:8}}>대기 항목 {status.pendingCount}개{status.reviewCount>0&&` · 확인 필요 ${status.reviewCount}개`}</p>
  {status.lastDigestOutcome==='evaluated_empty'&&<p className="metadata" style={{marginTop:8}}>최근 요약 확인에서는 새 항목이 없어 이메일을 보내지 않았습니다.</p>}
  <p className="note" style={{marginTop:14}}>현재 알림 화면에서 새로 확인할 때 처리합니다. 표시 시각에 자동 발송된다는 의미는 아닙니다.</p>
  {status.reviewCount>0&&<p className="note warning" style={{marginTop:12}}>결과가 불확실하거나 현재 조건이 달라진 항목은 자동으로 다시 보내지 않습니다. 접수 내역은 내 기록 내보내기에도 포함됩니다.</p>}
  {status.recent.length>0&&<details style={{marginTop:16}}><summary>최근 이메일 처리 내역 · {status.recent.length}건</summary><p className="metadata" style={{margin:'12px 0'}}>한 건은 여러 알림을 모은 이메일 한 통입니다. ‘제공사 접수’는 수신함 도착 확인과 구분됩니다.</p>{status.recent.map(item=><div className="record-row" key={item.id}><div><h4>{statuses[item.status]||'확인 필요'}</h4><p className="metadata">{date(item.accepted_at||item.last_attempt_at||item.created_at,status.timeZone)} · {item.mode==='digest'?'하루 요약':'조건 알림'} · 시도 {item.attempts}회</p>{item.provider_id&&<p className="metadata" style={{overflowWrap:'anywhere'}}>접수 번호: {item.provider_id}</p>}{item.cancel_requested_at&&<p className="metadata">수신 설정 변경 후 재시도 중단</p>}</div></div>)}</details>}
 </section>;
}
