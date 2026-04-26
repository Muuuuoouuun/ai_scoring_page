"use client";

import Link from "next/link";
import { JournalIcon } from "@/components/JournalIcon";
import { ProductLogo } from "@/components/ProductLogo";
import { useLanguage } from "@/components/LanguageProvider";
import { tools } from "@/data/tools";
import { getGithubSignalThreads } from "@/lib/editorial";

export default function GithubTrendingPage() {
  const { lang } = useLanguage();
  const threads = getGithubSignalThreads(tools, lang);

  return (
    <main className="github-trending-page">
      <section className="github-hero section">
        <div>
          <span className="section-kicker">
            <JournalIcon name="github" />
            GITHUB SIGNALS
          </span>
          <h1>{lang === "ko" ? "개발자 도구 이슈를 리뷰 신호로 읽기" : "Read developer-tool issues as review signals"}</h1>
          <p>
            {lang === "ko"
              ? "참고 zip의 GitHub trending issue 화면을 현재 도구 데이터와 연결한 에디토리얼 보드입니다."
              : "An editorial board for GitHub-style issues connected to the current tool dataset."}
          </p>
        </div>
        <aside className="editorial-board-card">
          <span className="section-kicker">EDITORIAL BOARD</span>
          <strong>{lang === "ko" ? "Curating Intelligence" : "Curating intelligence"}</strong>
          <p>{lang === "ko" ? "성급한 별점보다 반복되는 이슈의 방향을 봅니다." : "We watch issue direction before star-count noise."}</p>
        </aside>
      </section>

      <section className="github-signal-layout">
        <div className="github-thread-list">
          {threads.map((thread) => (
            <article className="github-thread-card card" key={thread.id}>
              <div className="github-thread-meta">
                <ProductLogo name={thread.tool.name} size="sm" />
                <span>{thread.repo}</span>
                <strong>{thread.state}</strong>
              </div>
              <h2>{thread.title}</h2>
              <p>{thread.summary}</p>
              <div className="github-thread-stats">
                <span>{thread.comments} comments</span>
                <span>{thread.heat}/10 heat</span>
                <Link href={`/tools/${thread.tool.id}?view=discussion`}>
                  {lang === "ko" ? "토론 보기" : "View debate"}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <aside className="github-side-panel card">
          <span className="section-kicker">ACTIVE DISCOURSES</span>
          {threads.slice(0, 3).map((thread) => (
            <Link href={`/tools/${thread.tool.id}`} key={thread.id}>
              <strong>{thread.tool.name}</strong>
              <small>{thread.comments} comments</small>
            </Link>
          ))}
        </aside>
      </section>
    </main>
  );
}
