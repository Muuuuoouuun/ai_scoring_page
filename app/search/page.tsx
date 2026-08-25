"use client";

import { Suspense } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import SearchClient from "@/app/search/SearchClient";

export default function SearchPage() {
  const { t } = useLanguage();

  return (
    <main className="search-journal-page">
      <section className="section search-journal-hero">
        <span className="section-kicker">MATCH WORKBENCH</span>
        <h1>{t.searchTitle}</h1>
        <p>{t.searchDesc}</p>
      </section>
      <Suspense fallback={<p className="section">{t.searchLoading}</p>}>
        <SearchClient />
      </Suspense>
    </main>
  );
}
