"use client";

import { copy as t } from "@/lib/copy";

export function BestWorstNarratives({ bestCase, worstCase }: { bestCase: string; worstCase: string }) {

  return (
    <section className="card scenario-assessment">
      <div className="scenario-assessment-head">
        <span className="section-kicker">SCENARIO ASSESSMENT</span>
        <h2>{t.bestCase} / {t.worstCase}</h2>
      </div>
      <div className="scenario-grid">
        <div className="scenario-card scenario-card-best">
          <strong>{t.bestCase}</strong>
          <p>{bestCase}</p>
        </div>
        <div className="scenario-card scenario-card-worst">
          <strong>{t.worstCase}</strong>
          <p>{worstCase}</p>
        </div>
      </div>
    </section>
  );
}
