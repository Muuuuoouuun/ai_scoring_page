"use client";

import { Suspense } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import SearchClient from "@/app/search/SearchClient";
import { tools } from "@/data/tools";

export default function SearchPage() {
  const { t } = useLanguage();
  const problemContexts = Array.from(new Set(tools.flatMap((tool) => tool.problemContexts))).slice(0, 8);

  return (
    <main>
      <section className="section">
        <h1>{t.searchTitle}</h1>
        <p>{t.searchDesc}</p>
      </section>
      <Suspense fallback={<p className="section">{t.searchLoading}</p>}>
        <SearchClient tools={tools} problemContexts={problemContexts} />
      </Suspense>
    </main>
  );
}
