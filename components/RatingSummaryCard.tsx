"use client";

import type { RankInfo, ToolScore } from "@/lib/scoring";
import { scoreToStars } from "@/lib/scoring";
import { useToolReviews } from "@/components/useToolReviews";
import { useLanguage } from "@/components/LanguageProvider";
import { StarRating } from "@/components/StarRating";
import { TierChip } from "@/components/TierChip";

const STARS = [5, 4, 3, 2, 1] as const;

export function RatingSummaryCard({ toolId, score, rank }: { toolId: string; score: ToolScore; rank?: RankInfo }) {
  const { t } = useLanguage();
  const { summary } = useToolReviews(toolId);

  return (
    <section className="card rating-summary-card">
      <span className="section-kicker">STAR SIGNAL</span>
      <strong>{t.ratingSummaryTitle}</strong>
      <div className="rating-summary-headline">
        <span className="rating-summary-number">{score.stars.toFixed(1)}</span>
        <div className="rating-summary-headline-copy">
          <StarRating value={score.stars} size="lg" showValue={false} />
          <small>
            {t.editorialStars} · {t.scoreComposite} {score.composite}
          </small>
        </div>
        <TierChip tier={score.tier} />
      </div>
      {rank ? (
        <p className="rating-summary-rank">
          {t.rankOverall} {rank.overall}/{rank.total}
          {rank.category && rank.categoryTotal ? ` · ${t.rankCategory} ${rank.category}/${rank.categoryTotal}` : ""}
        </p>
      ) : null}
      {score.external ? (
        <div className="rating-summary-row">
          <span>{t.externalStars}</span>
          <StarRating value={scoreToStars(score.external.score)} size="sm" />
          <small>
            {score.external.count}
            {t.scoreExternalSites}
          </small>
        </div>
      ) : null}
      <div className="rating-summary-row">
        <span>{t.communityStars}</span>
        {summary.count > 0 ? (
          <>
            <StarRating value={summary.average} size="sm" />
            <small>
              {summary.count}
              {t.ratingCount}
            </small>
          </>
        ) : (
          <small className="rating-summary-empty">{t.noRatingsYet}</small>
        )}
      </div>
      {summary.count > 0 ? (
        <ul className="rating-histogram" aria-label={t.communityStars}>
          {STARS.map((star) => {
            const count = summary.distribution[star];
            const percent = Math.round((count / summary.count) * 100);
            return (
              <li key={star}>
                <span>{star}★</span>
                <span className="rating-histogram-bar">
                  <span style={{ width: `${percent}%` }} />
                </span>
                <small>{count}</small>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
