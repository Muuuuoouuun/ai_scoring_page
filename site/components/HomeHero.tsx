import Link from '@/components/Link';
import {categories} from '@/lib/catalog';
import {updates,dateLabel} from '@/lib/content';
import {ToolLogo} from '@/components/ToolUI';
import {Search,ArrowRight,ArrowUpRight} from '@/components/Icons';

/** The search and artwork render without waiting for personal or community data. */
export default function HomeHero(){
  return <section className="hero discovery-hero">
    <div className="hero-main">
      <div className="hero-copy">
        <span className="eyebrow"><span className="hero-dot"/>A better way to work</span>
        <h1>일에 맞는 도구를 찾고,<br/>쓰는 방법까지 확인하세요.</h1>
        <p>AI·SaaS의 기능, 조건, 활용 경험을 한곳에서.</p>
        <form action="/search" className="search-bar" role="search">
          <Search size={20} aria-hidden="true"/>
          <input name="q" aria-label="도구 또는 하고 싶은 일 검색" placeholder="도구 또는 업무 검색"/>
          <button className="button primary" type="submit">찾기<ArrowRight size={16}/></button>
        </form>
        <div className="quick-links">{['보고서 작성','회의 정리','코딩','이미지 제작'].map(q=><Link key={q} href={'/search?q='+encodeURIComponent(q)}>{q}<ArrowUpRight size={12}/></Link>)}</div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <img src="/images/discovery-studio.webp" srcSet="/images/discovery-studio-small.webp 480w, /images/discovery-studio.webp 960w" sizes="(max-width:760px) 200px, 440px" width="960" height="640" alt="" fetchPriority="high" decoding="async"/>
        <span className="art-caption">FIND YOUR NEXT TOOL</span>
      </div>
    </div>
    <nav className="category-strip" aria-label="업무별 탐색">{Object.entries(categories).filter(([id])=>id!=='all').map(([id,label])=><Link className="chip" href={'/explore?genre='+id} key={id}>{label}</Link>)}</nav>
    <aside className="hero-side">
      <div className="section-heading"><h2 className="updates-title">최근 공식 업데이트</h2><Link className="text-link" href="/news">소식 전체 보기<ArrowRight size={15}/></Link></div>
      <div className="hero-updates">{updates.slice(0,3).map(u=><Link className="news-mini" key={u.id} href={'/news/'+u.id}><ToolLogo tool={u.tool} size={40}/><div><span className="metadata">{u.tool.name} · {dateLabel(u.publishedAt)}</span><h3>{u.title}</h3></div><ArrowUpRight size={16}/></Link>)}</div>
    </aside>
  </section>;
}
