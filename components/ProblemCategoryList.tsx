"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export function ProblemCategoryList() {
  const { t } = useLanguage();

  return (
    <section className="section">
      <div className="section-head text-center">
        <h2>{t.problemTitle}</h2>
        <p className="text-muted">{t.problemDesc}</p>
      </div>
      <div className="problem-chip-grid">
        {t.problems.map((problem) => (
          <Link
            className="problem-chip"
            key={problem}
            href={`/search?problem=${encodeURIComponent(problem)}`}
          >
            {problem}
          </Link>
        ))}
      </div>
    </section>
  );
}
