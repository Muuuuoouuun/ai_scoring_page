"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export function ProblemCategoryList() {
  const { lang, t } = useLanguage();

  return (
    <section className="section problem-journal-section">
      <div className="journal-section-head">
        <span className="section-kicker">SITUATION COMPASS</span>
        <h2>{t.problemTitle}</h2>
        <p className="text-muted">{t.problemDesc}</p>
      </div>
      <div className="situation-list">
        {t.problems.map((problem, index) => (
          <Link className="situation-row" href={`/search?problem=${encodeURIComponent(problem)}`} key={problem}>
            <span className="situation-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="situation-copy">
              <strong>{problem}</strong>
              <small>
                {lang === "ko"
                  ? "이 문제 상황에 맞는 도구와 판단 배지를 확인합니다."
                  : "Open tools and judgment badges mapped to this situation."}
              </small>
            </span>
            <span className="situation-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
