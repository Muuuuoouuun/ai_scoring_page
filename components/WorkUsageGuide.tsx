"use client";

import type { WorkPlaybook } from "@/lib/insights";
import { useLanguage } from "@/components/LanguageProvider";

export function WorkUsageGuide({ playbook }: { playbook: WorkPlaybook[] }) {
  const { t } = useLanguage();

  return (
    <section className="card">
      <strong>{t.workGuide}</strong>
      <div className="grid">
        {playbook.map((item) => (
          <article className="usage-item" key={item.title}>
            <h3>{item.title}</h3>
            <p>
              <strong>{t.howToUse}:</strong> {item.howToUse}
            </p>
            <p>
              <strong>{t.tips}:</strong> {item.recommendation}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
