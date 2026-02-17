"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <main>
      <section className="hero">
        <h1>{t.aboutTitle}</h1>
        <p>{t.aboutDesc}</p>
      </section>
      <section className="section">
        <h2>{t.aboutDiffTitle}</h2>
        <div className="grid grid-3">
          {t.aboutCards.map((card) => (
            <div className="card" key={card.title}>
              <strong>{card.title}</strong>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
