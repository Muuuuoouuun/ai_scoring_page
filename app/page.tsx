"use client";

import { Hero } from "@/components/Hero";
import { PrinciplesBar } from "@/components/PrinciplesBar";
import { ProblemCategoryList } from "@/components/ProblemCategoryList";
import { ToolCard } from "@/components/ToolCard";
import { useLanguage } from "@/components/LanguageProvider";
import { tools } from "@/data/tools";

export default function HomePage() {
  const { lang, t } = useLanguage();
  const featured = tools.slice(0, 3);
  const averageSignal =
    Math.round(
      (tools.reduce((sum, tool) => {
        const values = Object.values(tool.impact);
        return sum + values.reduce((impactSum, value) => impactSum + value, 0) / values.length;
      }, 0) /
        tools.length) *
        10
    ) / 10;
  const contextCount = new Set(tools.flatMap((tool) => tool.problemContexts)).size;
  const cautionCount = tools.filter((tool) => tool.verdictBadges.thinkCarefully).length;

  return (
    <main className="home-journal">
      <section className="home-hero-canvas">
        <Hero />
      </section>
      <section className="section featured-journal-section">
        <div className="journal-section-head journal-section-head-row">
          <div>
            <span className="section-kicker">FEATURED MATRIX</span>
            <h2 className="section-title">{t.featuredTitle}</h2>
          </div>
          <p className="text-muted">
            {lang === "ko"
              ? "대표 도구를 점수, 배지, 사용 맥락이 함께 보이는 저널 카드로 묶었습니다."
              : "Featured tools framed by score, badges, and the context where they matter."}
          </p>
        </div>
        <div className="featured-bento">
          {featured[0] ? <ToolCard key={featured[0].id} tool={featured[0]} variant="feature" /> : null}
          <aside className="signal-lens-card" aria-label={lang === "ko" ? "저널 신호 요약" : "Journal signal summary"}>
            <div>
              <span className="section-kicker">REASONING LENS</span>
              <h3>{lang === "ko" ? "판단 신호 밀도" : "Judgment signal density"}</h3>
            </div>
            <div className="signal-wave-bars" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <dl className="signal-lens-metrics">
              <div>
                <dt>{lang === "ko" ? "도구" : "Tools"}</dt>
                <dd>{tools.length}</dd>
              </div>
              <div>
                <dt>{lang === "ko" ? "문제 신호" : "Signals"}</dt>
                <dd>{contextCount}</dd>
              </div>
              <div>
                <dt>{lang === "ko" ? "평균 임팩트" : "Avg impact"}</dt>
                <dd>{averageSignal}</dd>
              </div>
              <div>
                <dt>{lang === "ko" ? "주의 노트" : "Cautions"}</dt>
                <dd>{cautionCount}</dd>
              </div>
            </dl>
          </aside>
          <div className="featured-stack">
            {featured.slice(1).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>
      <ProblemCategoryList />
      <PrinciplesBar />
    </main>
  );
}
