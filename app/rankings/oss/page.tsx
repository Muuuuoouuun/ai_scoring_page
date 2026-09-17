"use client";

import Link from "next/link";
import { JournalIcon } from "@/components/JournalIcon";
import { ProductLogo } from "@/components/ProductLogo";
import { useLanguage } from "@/components/LanguageProvider";
import { tools } from "@/data/tools";
import { getOssRankingRows } from "@/lib/editorial";

export default function OssRankingsPage() {
  const { lang } = useLanguage();
  const rankings = getOssRankingRows(tools);

  return (
    <main className="rankings-page">
      <section className="rankings-hero section">
        <div>
          <span className="section-kicker">
            <JournalIcon name="ranking" />
            OSS RANKINGS
          </span>
          <h1>{lang === "ko" ? "오픈소스/개발 도구 신호 랭킹" : "Open source and developer-tool signal rankings"}</h1>
          <p>
            {lang === "ko"
              ? "성장성, 안정성, 혁신성을 따로 보고 실무 도입 리스크까지 함께 읽습니다."
              : "Read growth, stability, and innovation separately with adoption risk in view."}
          </p>
        </div>
        <div className="ranking-score-plate" aria-label={lang === "ko" ? "랭킹 도구 수" : "Ranked tool count"}>
          <strong>{rankings.length}</strong>
          <span>{lang === "ko" ? "ranked signals" : "ranked signals"}</span>
        </div>
      </section>

      <section className="ranking-board card">
        <div className="ranking-board-head">
          <span>{lang === "ko" ? "순위" : "Rank"}</span>
          <span>{lang === "ko" ? "도구" : "Tool"}</span>
          <span>Growth</span>
          <span>Stability</span>
          <span>Innovation</span>
          <span>{lang === "ko" ? "토론" : "Discourse"}</span>
        </div>
        {rankings.map((row, index) => (
          <article className="ranking-row" key={row.tool.id}>
            <div className="rank-number">#{index + 1}</div>
            <div className="ranking-tool">
              <ProductLogo name={row.tool.name} size="sm" />
              <div>
                <h2>{row.tool.name}</h2>
                <p>{row.tool.problemContexts[0]}</p>
              </div>
            </div>
            <meter min="0" max="100" value={row.growth} />
            <meter min="0" max="100" value={row.stability} />
            <meter min="0" max="100" value={row.innovation} />
            <Link href={`/tools/${row.tool.id}?view=discussion`}>
              {row.activeDiscourses} {lang === "ko" ? "개" : "threads"}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
