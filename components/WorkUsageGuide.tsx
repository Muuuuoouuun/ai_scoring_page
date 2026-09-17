"use client";

import type { WorkPlaybook } from "@/lib/insights";
import { useLanguage } from "@/components/LanguageProvider";

export function WorkUsageGuide({ playbook }: { playbook: WorkPlaybook[] }) {
  const { t } = useLanguage();

  return (
    <section className="card feature-card">
      <span className="section-kicker">PRACTICAL GUIDE</span>
      <strong>{t.workGuide}</strong>
      <div className="grid">
        {playbook.map((item) => (
          <article className="usage-item" key={item.title}>
            <h3>{item.title}</h3>
            <div className="usage-item-details">
              <p>
                <span className="usage-label">{t.howToUse}:</span> {item.howToUse}
              </p>
              <p>
                <span className="usage-label">{t.tips}:</span> {item.recommendation}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
