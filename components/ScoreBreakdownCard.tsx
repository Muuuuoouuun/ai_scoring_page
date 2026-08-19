"use client";

import type { ScoreBreakdown } from "@/lib/insights";
import { useLanguage } from "@/components/LanguageProvider";

export function ScoreBreakdownCard({
  totalScore,
  scoreBreakdown,
  variant = "default"
}: {
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
  variant?: "default" | "hero";
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
    <section className={`card score-breakdown-card score-breakdown-${variant}`}>
      <span className="section-kicker">UTILITY SCORE</span>
      <strong>{t.scoreTitle}</strong>
      <p className="total-score">
        <span>{totalScore}</span>
        <small>/100</small>
      </p>
      <div className="score-grid">
        {Object.entries(scoreBreakdown).map(([key, value]) => (
          <div key={key} className="score-row">
            <span className="score-row-label">{labels[key as keyof ScoreBreakdown]}</span>
            <span className="score-row-bar" aria-hidden="true">
              <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
            </span>
            <strong className="score-row-value">{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
