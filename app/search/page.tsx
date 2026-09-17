"use client";

import { Suspense } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import SearchClient from "@/app/search/SearchClient";
import { tools } from "@/data/tools";

export default function SearchPage() {
  const { t } = useLanguage();
  // 도구마다 대표 문제 상황 1개씩 노출해 SaaS와 AI 도구가 고르게 보이도록 합니다.
  const problemContexts = Array.from(new Set(tools.map((tool) => tool.problemContexts[0]))).slice(0, 12);

  return (
    <main className="search-journal-page">
      <section className="section search-journal-hero">
        <span className="section-kicker">MATCH WORKBENCH</span>
        <h1>{t.searchTitle}</h1>
        <p>{t.searchDesc}</p>
      </section>
      <Suspense fallback={<p className="section">{t.searchLoading}</p>}>
        <SearchClient tools={tools} problemContexts={problemContexts} />
      </Suspense>
    </main>
  );
}
