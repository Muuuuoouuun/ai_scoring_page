"use client";

import { Hero } from "@/components/Hero";
import { PrinciplesBar } from "@/components/PrinciplesBar";
import { ProblemCategoryList } from "@/components/ProblemCategoryList";
import { ToolCard } from "@/components/ToolCard";
import { copy as t } from "@/lib/copy";
import { tools } from "@/data/tools";
import { problemTags } from "@/lib/problems";
import { getTotalScore } from "@/lib/insights";

export default function HomePage() {
  /*
   * 홈의 숫자는 "이 사이트가 뭘 가지고 있는지"를 말합니다.
   * 이전에는 임팩트 4축 평균(6.3)을 보여줬는데, 그 척도는 폐기됐고
   * 애초에 방문자가 그 숫자로 할 수 있는 일이 없었습니다.
   */
  const featured = [...tools].sort(
    (a, b) => getTotalScore(b.review.scoreBreakdown) - getTotalScore(a.review.scoreBreakdown)
  );
  const scores = tools.map((tool) => getTotalScore(tool.review.scoreBreakdown));
  const disqualifiers = tools.reduce((sum, tool) => sum + tool.review.doNotUseIf.length, 0);

  return (
    <main id="main-content" className="home-journal">
      <section className="home-hero-canvas">
        <Hero />
      </section>

      <ProblemCategoryList />

      <section className="section featured-journal-section">
        <div className="journal-section-head journal-section-head-row">
          <div>
            <span className="section-kicker">TOOLS COVERED</span>
            <h2 className="section-title">{t.featuredTitle}</h2>
          </div>
          <p className="text-muted">{t.featuredDesc}</p>
        </div>

        <dl className="coverage-strip">
          <div>
            <dt>정리한 도구</dt>
            <dd>{tools.length}</dd>
          </div>
          <div>
            <dt>문제 상황</dt>
            <dd>{problemTags.length}</dd>
          </div>
          <div>
            <dt>총점 분포</dt>
            <dd>
              {Math.min(...scores)}–{Math.max(...scores)}
            </dd>
          </div>
          <div>
            <dt>기록된 탈락 조건</dt>
            <dd>{disqualifiers}</dd>
          </div>
        </dl>

        <div className="grid grid-3 search-result-grid">
          {featured.slice(0, 3).map((tool) => (
            <ToolCard key={tool.id} tool={tool} selectable />
          ))}
        </div>
      </section>

      <PrinciplesBar />
    </main>
  );
}
