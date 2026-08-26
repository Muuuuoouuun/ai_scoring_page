"use client";

import Link from "next/link";
import { copy as t } from "@/lib/copy";
import { NeuralFlowSVG } from "@/components/NeuralFlowSVG";

export function Hero() {

  return (
    <section className="hero">
      <div className="hero-bg-anim">
        <NeuralFlowSVG />
      </div>
      <div className="hero-content">
        <span className="hero-kicker">TOOL ADOPTION DECISIONS</span>
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
