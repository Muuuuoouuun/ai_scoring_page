"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <div>
        <h1>{t.heroTitle}</h1>
        <p>{t.heroDesc}</p>
      </div>
      <div>
        <Link className="button" href="/search">
          {t.heroCta}
        </Link>
      </div>
    </section>
  );
}
