import Link from '@/components/Link';
import {ArrowUpRight} from '@/components/Icons';
import {dateLabel} from '@/lib/content';
import {filterIndustryNews, industryNews, industryTopics, normalizeIndustryTopic} from '@/lib/industry-news';
import './industry-news.css';

export default function IndustryNews({topic = 'all'}: {topic?: string}) {
  const selected = normalizeIndustryTopic(topic);
  const items = filterIndustryNews(selected);
  const checkedAt = industryNews.map(item => item.sourceCheckedAt).sort().at(-1);

  return <section className="industry-news" aria-labelledby="industry-heading">
    <div className="industry-intro">
      <div><span className="eyebrow">Industry brief</span><h2 id="industry-heading">AI·SaaS 산업의 변화를 읽다</h2><p>공식 발표를 짧게 읽고, 도구 선택과 업무에 어떤 의미인지 살펴보세요.</p></div>
      <span className="metadata">출처 확인 {dateLabel(checkedAt)}</span>
    </div>
    <nav className="filters" aria-label="산업 동향 주제">
      {Object.entries(industryTopics).map(([id, label]) => <Link key={id} href={'/news?tab=industry&topic=' + id} aria-current={selected === id ? 'page' : undefined} className={'button small ' + (selected === id ? 'primary' : 'ghost')}>{label}</Link>)}
    </nav>
    <p className="note industry-method">공식 발표의 사실 요약과 편집자의 ‘살펴볼 점’을 함께 제공합니다. 발표일과 확인일을 구분하며, 출시 예정·비공개 시험 기능은 본문에 표시합니다.</p>
    <div className="industry-list">
      {items.map(item => <article className="industry-article" key={item.id} id={item.id}>
        <div className="industry-article-meta"><span className="badge gray">{industryTopics[item.topic]}</span><span className="metadata">{item.sourceName} · 발표 <time dateTime={item.publishedAt}>{dateLabel(item.publishedAt)}</time></span></div>
        <h3><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.title}<ArrowUpRight size={17}/></a></h3>
        <p>{item.summary}</p>
        <div className="industry-takeaway"><strong>살펴볼 점</strong><p>{item.takeaway}</p></div>
        <div className="industry-source"><a className="text-link" href={item.sourceUrl} target="_blank" rel="noreferrer" aria-label={item.sourceName + ' 공식 원문: ' + item.sourceTitle}>공식 원문<ArrowUpRight size={13}/></a><span className="metadata">출처 확인 <time dateTime={item.sourceCheckedAt}>{dateLabel(item.sourceCheckedAt)}</time></span></div>
      </article>)}
    </div>
  </section>;
}
