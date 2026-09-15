"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function KeyFeaturesCard({
  features,
  pricingSummary,
  koreaNote
}: {
  features: string[];
  pricingSummary: string;
  koreaNote?: string;
}) {
  const { t } = useLanguage();

  if (features.length === 0 && !pricingSummary && !koreaNote) {
    return null;
  }

  return (
    <section className="card feature-card key-features-card">
      <span className="section-kicker">CAPABILITY MAP</span>
      <strong>{t.keyFeaturesTitle}</strong>
      {features.length > 0 ? (
        <ul className="key-feature-list">
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      ) : null}
      {pricingSummary ? (
        <div className="key-feature-note">
          <span className="usage-label">{t.pricingTitle}</span>
          <p>{pricingSummary}</p>
        </div>
      ) : null}
      {koreaNote ? (
        <div className="key-feature-note">
          <span className="usage-label">{t.koreaNoteTitle}</span>
          <p>{koreaNote}</p>
        </div>
      ) : null}
    </section>
  );
}
