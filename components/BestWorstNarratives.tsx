"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function BestWorstNarratives({ bestCase, worstCase }: { bestCase: string; worstCase: string }) {
  const { t } = useLanguage();

  return (
    <section className="section grid grid-3">
      <div className="card">
        <strong>{t.bestCase}</strong>
        <p>{bestCase}</p>
      </div>
      <div className="card">
        <strong>{t.worstCase}</strong>
        <p>{worstCase}</p>
      </div>
    </section>
  );
}
