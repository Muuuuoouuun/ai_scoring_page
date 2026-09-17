"use client";

import { useLanguage } from "@/components/LanguageProvider";
import RecommenderClient from "@/components/RecommenderClient";

export default function RecommendPage() {
  const { t } = useLanguage();

  return (
    <main className="recommend-page">
      <section className="section recommend-hero">
        <span className="section-kicker">FIT ENGINE</span>
        <h1>{t.recommendTitle}</h1>
        <p className="text-muted">{t.recommendDesc}</p>
      </section>
      <RecommenderClient />
    </main>
  );
}
