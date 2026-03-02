"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { NeuralFlowSVG } from "@/components/NeuralFlowSVG";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <div className="hero-bg-anim">
        <NeuralFlowSVG />
      </div>
      <div className="hero-content">
        <h1>{t.heroTitle}</h1>
        <p>{t.heroDesc}</p>
      </div>
      <div className="hero-actions">
        <Link className="button button-lg" href="/search">
          {t.heroCta}
        </Link>
      </div>
    </section>
  );
}
