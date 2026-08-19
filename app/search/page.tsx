"use client";

import { Suspense } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import SearchClient from "@/app/search/SearchClient";
import { tools } from "@/data/tools";

export default function SearchPage() {
  const { t } = useLanguage();
  const problemContexts = Array.from(new Set(tools.flatMap((tool) => tool.problemContexts))).slice(0, 8);

  return (
    <main id="main-content" className="search-journal-page">
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
