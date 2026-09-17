"use client";

import { copy as t } from "@/lib/copy";

export function PrinciplesBar() {

  return (
    <section className="section principles-section">
      <div className="journal-section-head">
        <span className="section-kicker">REVIEW PRINCIPLES</span>
        <h2>{t.principlesTitle}</h2>
      </div>
      <div className="principles-grid">
        {t.principles.map((principle, index) => (
          <div className="home-principle" key={principle.title}>
            <span className="principle-number">{(index + 1).toString().padStart(2, "0")}</span>
            <h3>{principle.title}</h3>
            <p>{principle.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
