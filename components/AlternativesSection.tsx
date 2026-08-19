"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function AlternativesSection({ alternatives }: { alternatives: string[] }) {
  const { t } = useLanguage();

  return (
    <section className="card alternatives-card">
      <strong>{t.alternatives}</strong>
      <ul className="alternatives-list">
        {alternatives.map((alternative) => (
          <li key={alternative}>{alternative}</li>
        ))}
      </ul>
    </section>
  );
}
