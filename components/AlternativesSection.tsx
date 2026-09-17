"use client";

import { copy as t } from "@/lib/copy";

export function AlternativesSection({ alternatives }: { alternatives: string[] }) {

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
