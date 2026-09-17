"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { tools } from "@/data/tools";

/**
 * 홈과 검색이 같은 태그 목록을 씁니다.
 * 이전에는 홈이 i18n에 하드코딩된 문장 6개를, 검색이 도구 배열 앞쪽에서 뽑은 8개를 보여줘서
 * 두 화면의 목록이 서로 달랐고, 30개 문제 중 22개는 어디서도 클릭할 수 없었습니다.
 */
export function ProblemCategoryList() {
  const tags = getRankedTags();

  // Same matching rule the search page uses, so the count on a row is the count you land on.
  const matchesFor = (problem: string) =>
    tools.filter((tool) =>
      tool.problemContexts.some((context) => context.toLowerCase().includes(problem.toLowerCase()))
    );

  return (
    <section className="section problem-journal-section">
      <div className="journal-section-head">
        <span className="section-kicker">SITUATION COMPASS</span>
        <h2>{t.problemTitle}</h2>
        <p className="text-muted">{t.problemDesc}</p>
      </div>
      <div className="situation-list">
        {t.problems.map((problem, index) => {
          const matched = matchesFor(problem);
          const cautions = matched.filter((tool) => tool.verdictBadges.thinkCarefully).length;

          return (
            <Link className="situation-row" href={`/search?problem=${encodeURIComponent(problem)}`} key={problem}>
              <span className="situation-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="situation-copy">
                <strong>{problem}</strong>
                <small>
                  {matched.length > 0
                    ? matched
                        .slice(0, 3)
                        .map((tool) => tool.name)
                        .join(" · ")
                    : lang === "ko"
                      ? "아직 매칭된 도구가 없습니다."
                      : "No mapped tools yet."}
                </small>
              </span>
              <span className="situation-stats">
                <span className="situation-count">
                  <b>{matched.length}</b>
                  <em>{lang === "ko" ? "도구" : "tools"}</em>
                </span>
                {cautions > 0 ? (
                  <span className="situation-caution">
                    {lang === "ko" ? `주의 ${cautions}` : `${cautions} caution`}
                  </span>
                ) : null}
              </span>
              <span className="situation-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
