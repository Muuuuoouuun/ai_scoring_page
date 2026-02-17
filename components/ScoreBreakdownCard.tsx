"use client";

import type { ScoreBreakdown } from "@/lib/insights";
import { useLanguage } from "@/components/LanguageProvider";

export function ScoreBreakdownCard({
  totalScore,
  scoreBreakdown
}: {
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
}) {
  const { t } = useLanguage();
  const labels: Record<keyof ScoreBreakdown, string> = {
    functionality: t.scoreLabels[0],
    uiux: t.scoreLabels[1],
    reliability: t.scoreLabels[2],
    comfort: t.scoreLabels[3],
    pricing: t.scoreLabels[4]
  };

  return (
    <section className="card">
      <strong>{t.scoreTitle}</strong>
      <p className="total-score">{totalScore} / 100</p>
      <div className="score-grid">
        {Object.entries(scoreBreakdown).map(([key, value]) => (
          <div key={key} className="score-row">
            <span>{labels[key as keyof ScoreBreakdown]}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
