import {toolGenres} from '@/lib/tool-genres';
import Link from '@/components/Link';
import {categories} from '@/lib/catalog';
import {updates, events, dateLabel, type Event} from '@/lib/content';
import {ToolLogo} from '@/components/ToolUI';
import {ArrowUpRight} from '@/components/Icons';
import {liveFeed} from '@/lib/source-sync';
import {eventPhase} from '@/lib/event-phase';
import SaveContent from '@/components/SaveContent';
import IndustryNews from '@/components/IndustryNews';
import UpdateMeta from '@/components/UpdateMeta';

function EventCard({event: e, now}: {event: Event; now: number}) {
  const phase = eventPhase(e.startsAt, e.endsAt, now);
  const ended = phase === 'ended';
  const datesOnly = e.schedulePrecision === 'day';
  return <article className="panel" id={e.id}>
    <div className="section-heading"><span className={'badge ' + (ended ? 'gray' : 'green')}>{ended ? '종료' : phase === 'live' ? datesOnly ? '개최 기간' : '진행 중' : '예정'} · {e.type}</span><SaveContent type="event" target={e.id} title={e.title}/></div>
    <h3 style={{fontSize:22}}>{e.title}</h3>
    <p style={{fontSize:13, margin:'12px 0 18px'}}>{e.summary}</p>
    <ul className="info-list">
      <li><span>{datesOnly ? '개최일' : '일시'}</span><strong>{dateLabel(e.date)}{e.endDate && e.endDate !== e.date ? ' – ' + dateLabel(e.endDate) : ''}{!datesOnly && <> {e.startTime}–{e.endTime}</>}<span className="metadata event-date-note">{e.timeZone} 현지 기준{datesOnly ? ' · 세부 시간은 공식 일정 확인' : ''}</span></strong></li>
      <li><span>참가 상태</span><strong>{ended ? '행사 종료' : e.registrationStatus || '공식 신청 페이지에서 접수 여부 확인'}</strong></li>
      <li><span>장소</span><strong>{e.location}</strong></li>
      <li><span>참가비</span><strong>{e.cost}</strong></li>
    </ul>
    <p className="note warning" style={{margin:'18px 0'}}>{e.eligibility}</p>
    <a className="button secondary" href={e.url} target="_blank" rel="noreferrer">{ended ? '공식 행사 정보' : '상세·참가 조건'}<ArrowUpRight size={15}/></a>
    <span className="metadata" style={{marginTop:13}}>주최 {e.organizer} · 확인일 {dateLabel(e.checkedAt)}</span>
  </article>;
}

export default async function Page({searchParams}: {searchParams: Promise<{tab?: string; category?: string; topic?: string}>}) {
  const {tab: requestedTab = 'updates', category = 'all', topic = 'all'} = await searchParams;
  const tab = ['updates', 'industry', 'events', 'feed'].includes(requestedTab) ? requestedTab : 'updates';
  const feed = tab === 'feed' ? await liveFeed() : [];
  // eslint-disable-next-line react-hooks/purity -- Server-rendered event status must reflect the current time.
  const now = Date.now();
  const activeEvents = events.filter(e => eventPhase(e.startsAt, e.endsAt, now) !== 'ended').sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const endedEvents = events.filter(e => eventPhase(e.startsAt, e.endsAt, now) === 'ended').sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  return <main className="container page" id="main">
    <div className="page-title"><div><span className="eyebrow">Keep up to date</span><h1>소식·행사</h1><p>제품 업데이트, 산업의 변화와 참여할 행사를 공식 출처로 확인하세요.</p></div><Link href="/sources" className="text-link">갱신 현황<ArrowUpRight size={14}/></Link></div>
    <nav className="tabs" aria-label="소식·행사 분류">
      <Link aria-current={tab === 'updates' ? 'page' : undefined} className={tab === 'updates' ? 'active' : ''} href="/news">업데이트</Link>
      <Link aria-current={tab === 'industry' ? 'page' : undefined} className={tab === 'industry' ? 'active' : ''} href="/news?tab=industry">산업 동향</Link>
      <Link aria-current={tab === 'events' ? 'page' : undefined} className={tab === 'events' ? 'active' : ''} href="/news?tab=events">행사</Link>
      <Link aria-current={tab === 'feed' ? 'page' : undefined} className={tab === 'feed' ? 'active' : ''} href="/news?tab=feed">공식 피드</Link>
      <Link href="/promotions">혜택</Link><Link href="/guides">활용 가이드</Link>
    </nav>
    {tab === 'industry' ? <IndustryNews topic={topic}/> : tab === 'feed' ? <>
      <p className="note" style={{marginBottom:18}}>공식 RSS·Atom 피드에서 자동 수집한 원문 제목입니다. 도구의 기존 기능·조건을 변경하는 검수 요약과 구분합니다.</p>
      {feed.length ? <div className="news-list">{feed.map(item => <article className="news-item" key={item.url}><div><span className="metadata">{item.toolId} · {dateLabel(item.date)}</span><h3><a href={item.url} target="_blank" rel="noreferrer">{item.title}<ArrowUpRight size={15}/></a></h3><span className="metadata">자동 수집 · 마지막 성공 {item.checkedAt ? dateLabel(item.checkedAt) : '미확인'}{item.stale ? ' · 최근 갱신 실패, 보관된 내용' : ''}</span></div></article>)}</div> : <div className="empty"><h3>아직 수집된 피드가 없습니다.</h3><p>출처·갱신 현황에서 공식 정보 확인을 진행할 수 있습니다.</p><Link className="button secondary" href="/sources">갱신 현황 보기</Link></div>}
    </> : tab === 'events' ? <>
      <p className="note" style={{marginBottom:18}}>행사 주최 측에서 확인한 일정입니다. 날짜 단위의 일정은 현지 개최 기간으로 표시하며, 실제 세션 시간·잔여석·요금은 공식 페이지에서 확인하세요.</p>
      <section className="event-group" aria-labelledby="active-events-heading"><div className="section-heading"><h2 id="active-events-heading">예정·진행 행사</h2><span className="metadata">{activeEvents.length}개</span></div>{activeEvents.length ? <div className="grid-2">{activeEvents.map(e => <EventCard key={e.id} event={e} now={now}/>)}</div> : <p className="note">새로 확인된 예정 행사가 없습니다.</p>}</section>
      {endedEvents.length > 0 && <section className="event-group" aria-labelledby="ended-events-heading"><div className="section-heading"><h2 id="ended-events-heading">지난 행사</h2><span className="metadata">{endedEvents.length}개</span></div><div className="grid-2">{endedEvents.map(e => <EventCard key={e.id} event={e} now={now}/>)}</div></section>}
    </> : <>
      <div className="filters">{Object.entries(categories).map(([id, label]) => <Link key={id} aria-current={category === id ? 'page' : undefined} className={'button small ' + (category === id ? 'primary' : 'ghost')} href={'/news?category=' + id}>{label}</Link>)}</div>
      <p className="note" style={{marginBottom:18}}>서비스별 최신 확인 업데이트입니다. 공지 모음은 개별 출시일을 확인한 소식과 구분합니다.</p>
      <div className="news-list">{updates.filter(u => category === 'all' || toolGenres(u.tool).includes(category)).map(u => <article className="news-item news-update" key={u.id}><ToolLogo tool={u.tool} size={43}/><div><span className="metadata">{u.tool.name}</span><h3><Link href={'/news/' + u.id}>{u.title}</Link></h3><p>{u.summary}</p><UpdateMeta update={u} checkedAt={u.tool.checkedAt}/></div><SaveContent type="news" target={u.id} title={u.title}/></article>)}</div>
    </>}
  </main>;
}
