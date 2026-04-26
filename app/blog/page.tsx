"use client";

import Link from "next/link";
import { JournalIcon } from "@/components/JournalIcon";
import { JournalArchiveSection } from "@/components/JournalArchiveSection";
import { ProductLogo } from "@/components/ProductLogo";
import { useLanguage } from "@/components/LanguageProvider";
import { tools } from "@/data/tools";
import { getGithubSignalThreads, getOssRankingRows } from "@/lib/editorial";

export default function BlogPage() {
  const { lang } = useLanguage();
  const githubSignals = getGithubSignalThreads(tools, lang).slice(0, 3);
  const rankingSignals = getOssRankingRows(tools).slice(0, 3);
  const editorialMetrics = [
    { label: lang === "ko" ? "리뷰 도구" : "Reviewed tools", value: tools.length },
    { label: lang === "ko" ? "랭킹 신호" : "Ranking signals", value: rankingSignals.length },
    { label: lang === "ko" ? "개발 이슈" : "Developer issues", value: githubSignals.length }
  ];

  return (
    <main className="curation-blog-page">
      <section className="section curation-blog-hero">
        <div>
          <span className="section-kicker">
            <JournalIcon name="archive" />
            CURATION BLOG
          </span>
          <h1>{lang === "ko" ? "큐레이션 블로그" : "Curation blog"}</h1>
          <p>
            {lang === "ko"
              ? "에디터가 정리한 도구 흐름, 랭킹 해석, GitHub 이슈 신호를 모아 읽는 공간입니다."
              : "Editorial notes for tool trends, ranking interpretation, and GitHub issue signals."}
          </p>
        </div>
        <Link className="button" href="/community">
          {lang === "ko" ? "커뮤니티 토론으로 이동" : "Go to community threads"}
        </Link>
      </section>

      <section className="blog-editorial-strip" aria-label={lang === "ko" ? "블로그 운영 지표" : "Blog editorial metrics"}>
        {editorialMetrics.map((metric) => (
          <div key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
        <div className="blog-editorial-status">
          <span className="section-kicker">CURRENT CURATION</span>
          <strong>{rankingSignals[0]?.tool.name ?? "TOPAI"}</strong>
          <small>{lang === "ko" ? "이번 주 기준점으로 추적 중" : "Tracked as this week's reference point"}</small>
        </div>
      </section>

      <section className="blog-feature-grid">
        <article className="blog-feature-card card">
          <span className="section-kicker">EDITORIAL NOTE</span>
          <h2>{lang === "ko" ? "커뮤니티와 분리한 이유" : "Why this is separate from community"}</h2>
          <p>
            {lang === "ko"
              ? "블로그는 검토된 관점과 큐레이션 기록을 쌓고, 커뮤니티는 사용자의 질문과 투표 기반 토론을 빠르게 흘려보냅니다."
              : "The blog keeps reviewed editorial context, while community keeps fast user questions, votes, and field debate."}
          </p>
        </article>
        <article className="blog-feature-card card">
          <span className="section-kicker">READING QUEUE</span>
          <div className="blog-link-stack">
            <Link href="/trending/github">
              <JournalIcon name="github" />
              <span>{lang === "ko" ? "GitHub 트렌딩 이슈" : "GitHub trending issues"}</span>
            </Link>
            <Link href="/rankings/oss">
              <JournalIcon name="ranking" />
              <span>{lang === "ko" ? "OSS 랭킹 해석" : "OSS ranking readout"}</span>
            </Link>
            <Link href="/archive">
              <JournalIcon name="archive" />
              <span>{lang === "ko" ? "저널 아카이브" : "Journal archive"}</span>
            </Link>
          </div>
        </article>
      </section>

      <section className="section blog-digest-grid">
        <div className="blog-digest-column">
          <div className="journal-section-head">
            <span className="section-kicker">GITHUB SIGNALS</span>
            <h2>{lang === "ko" ? "개발 이슈 읽기" : "Developer issue readout"}</h2>
          </div>
          {githubSignals.map((signal) => (
            <Link className="blog-digest-card" href="/trending/github" key={signal.id}>
              <ProductLogo name={signal.tool.name} size="sm" />
              <div>
                <strong>{signal.tool.name}</strong>
                <p>{signal.summary}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="blog-digest-column">
          <div className="journal-section-head">
            <span className="section-kicker">OSS RANKINGS</span>
            <h2>{lang === "ko" ? "랭킹의 맥락" : "Ranking context"}</h2>
          </div>
          {rankingSignals.map((row, index) => (
            <Link className="blog-digest-card" href="/rankings/oss" key={row.tool.id}>
              <strong className="blog-rank-number">#{index + 1}</strong>
              <div>
                <strong>{row.tool.name}</strong>
                <p>{lang === "ko" ? `종합 ${row.total}점, 토론 ${row.activeDiscourses}개` : `${row.total} total, ${row.activeDiscourses} threads`}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <JournalArchiveSection />
    </main>
  );
}
