"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export function ProblemCategoryList() {
  const { t } = useLanguage();

  return (
    <section className="section">
      <h2>{t.problemTitle}</h2>
      <div className="grid grid-3">
        {t.problems.map((problem) => (
          <Link
            className="card"
            key={problem}
            href={`/search?problem=${encodeURIComponent(problem)}`}
          >
            <strong>{problem}</strong>
            <p>{t.problemDesc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
