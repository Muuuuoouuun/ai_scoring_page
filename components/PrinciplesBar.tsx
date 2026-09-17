"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function PrinciplesBar() {
  const { t } = useLanguage();

  return (
    <section className="section principles-section">
      <div className="section-head text-center">
        <h2>{t.principlesTitle}</h2>
      </div>
      <div className="principles-grid">
        {t.principles.map((principle, index) => (
          <div className="principle-item" key={principle.title}>
            <span className="principle-number">{(index + 1).toString().padStart(2, "0")}</span>
            <h3>{principle.title}</h3>
            <p>{principle.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
