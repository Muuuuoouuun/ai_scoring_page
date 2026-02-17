"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function PrinciplesBar() {
  const { t } = useLanguage();

  return (
    <section className="section">
      <h2>{t.principlesTitle}</h2>
      <div className="grid grid-3">
        {t.principles.map((principle) => (
          <div className="card" key={principle.title}>
            <strong>{principle.title}</strong>
            <p>{principle.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
