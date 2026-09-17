"use client";

import type { ScoreBreakdown } from "@/lib/insights";
import type { RankInfo, ToolScore } from "@/lib/scoring";
import { useLanguage } from "@/components/LanguageProvider";
import { TierChip } from "@/components/TierChip";

export function ScoreBreakdownCard({
  totalScore,
  scoreBreakdown,
  variant = "default",
  note,
  score,
  rank
}: {
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
  variant?: "default" | "hero";
  note?: string;
  score?: ToolScore;
  rank?: RankInfo;
}) {
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
      <div className="total-score-row">
        <p className="total-score">
          <span>{totalScore}</span>
          <small>/100</small>
        </p>
        {score ? <TierChip tier={score.tier} /> : null}
      </div>
      {score ? (
        <p className="score-formula">
          {t.scoreEditorial} {score.editorial}
          {score.external ? ` · ${t.scoreExternal} ${score.external.score} (${score.external.count}${t.scoreExternalSites})` : ""}
          {rank ? ` · ${t.rankOverall} ${rank.overall}/${rank.total}` : ""}
        </p>
      ) : null}
      <div className="score-grid">
        {Object.entries(scoreBreakdown).map(([key, value]) => (
          <div key={key} className="score-row">
            <span>{labels[key as keyof ScoreBreakdown]}</span>
            <span className="score-bar" aria-hidden="true">
              <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
            </span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      {note ? (
        <small className="score-note">
          {note}
          {score?.external ? ` ${t.scoreFormula}.` : ""}
        </small>
      ) : null}
    </section>
  );
}
