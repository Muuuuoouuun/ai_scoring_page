"use client";

import type { ScoreBreakdown } from "@/lib/insights";
import { SCORE_FACET_KEYS } from "@/lib/insights";
import { useLanguage } from "@/components/LanguageProvider";

const scoreTone = (score: number) => {
  if (score >= 75) return "high";
  if (score >= 55) return "mid";
  return "low";
};

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
  const labels: Record<(typeof SCORE_FACET_KEYS)[number], string> = {
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
      <p className="score-basis-note">{t.scoreBasisNote}</p>
      <div className="score-grid">
        {SCORE_FACET_KEYS.map((key) => {
          const facet = scoreBreakdown[key];
          return (
            <div key={key} className={`score-row score-row-${scoreTone(facet.score)}`}>
              <div className="score-row-head">
                <span>{labels[key]}</span>
                <strong>{facet.score}</strong>
              </div>
              <div className="score-bar" aria-hidden="true">
                <span style={{ width: `${facet.score}%` }} />
              </div>
              <p className="score-reason">{facet.reason}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
