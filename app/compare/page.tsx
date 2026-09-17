"use client";

import { Suspense } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import CompareClient from "@/components/CompareClient";

export default function ComparePage() {
  const { t } = useLanguage();

  return (
    <main className="compare-page">
      <section className="section compare-hero">
        <span className="section-kicker">SIDE-BY-SIDE MATRIX</span>
        <h1>{t.compareTitle}</h1>
        <p className="text-muted">{t.compareDesc}</p>
      </section>
      <Suspense fallback={<p className="section">{t.searchLoading}</p>}>
        <CompareClient />
      </Suspense>
    </main>
  );
}
