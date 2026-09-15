"use client";

import type { ExternalRating } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

export function ExternalRatingsCard({
  ratings,
  researchedAt
}: {
  ratings: ExternalRating[];
  researchedAt: string;
}) {
  const { t } = useLanguage();

  if (ratings.length === 0) {
    return null;
  }

  return (
    <section className="card external-ratings-card">
      <span className="section-kicker">CROSS-SITE SIGNAL</span>
      <strong>{t.externalRatingsTitle}</strong>
      <p className="text-muted">{t.externalRatingsDesc}</p>
      <ul className="external-rating-list">
        {ratings.map((rating) => (
          <li key={`${rating.source}-${rating.score}`} className="external-rating-row">
            <div className="external-rating-source">
              {rating.url ? (
                <a href={rating.url} target="_blank" rel="noopener noreferrer">
                  {rating.source}
                </a>
              ) : (
                <span>{rating.source}</span>
              )}
              {rating.note ? <small>{rating.note}</small> : null}
            </div>
            <strong className="external-rating-score">{rating.score}</strong>
          </li>
        ))}
      </ul>
      {researchedAt ? (
        <small className="research-stamp">
          {t.researchedAt}: {researchedAt}
        </small>
      ) : null}
    </section>
  );
}
