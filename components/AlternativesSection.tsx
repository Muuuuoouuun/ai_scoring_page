"use client";

import { copy as t } from "@/lib/copy";

export function AlternativesSection({ alternatives }: { alternatives: string[] }) {

  return (
    <section className="card">
      <strong>{t.alternatives}</strong>
      <ul>
        {alternatives.map((alternative) => (
          <li key={alternative}>{alternative}</li>
        ))}
      </ul>
    </section>
  );
}
