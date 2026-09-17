"use client";

import type { ImpactScores } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

export function ImpactMeterGrid({ impact }: { impact: ImpactScores }) {
  const { t } = useLanguage();
  const labels: Record<keyof ImpactScores, string> = {
    judgmentSpeed: t.impactLabels[0],
    thinkingDepth: t.impactLabels[1],
    executionDensity: t.impactLabels[2],
    collaborationClarity: t.impactLabels[3]
  };

  return (
    <section className="card">
      <strong>{t.impactTitle}</strong>
      <div className="impact-grid">
        {Object.entries(impact).map(([key, value]) => (
          <div className="impact-item" key={key}>
            <label htmlFor={`impact-${key}`}>{labels[key as keyof ImpactScores]}</label>
            <meter id={`impact-${key}`} min={0} max={10} value={value} />
            <span>{value}/10</span>
          </div>
        ))}
      </div>
    </section>
  );
}
