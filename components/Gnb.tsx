"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export function Gnb() {
  const { lang, setLang, t } = useLanguage();

  return (
    <nav>
      <Link className="brand-lockup" href="/" aria-label="g2 judgment journal home">
        <span className="brand-mark">g2</span>
        <span className="brand-copy">
          <strong>Judgment Journal</strong>
          <small>AI tool field notes</small>
        </span>
      </Link>
      <div className="nav-links">
        <Link href="/search">{t.navSearch}</Link>
        <Link href="/recommend">{t.navRecommend}</Link>
        <Link href="/compare">{t.navCompare}</Link>
        <Link href="/resources">{t.navResources}</Link>
        <Link href="/community">{t.navCommunity}</Link>
        <Link href="/about">{t.navAbout}</Link>
      </div>
      <div className="lang-switch" aria-label="Language switch">
        <button
          type="button"
          className={lang === "ko" ? "active" : ""}
          onClick={() => setLang("ko")}
        >
          KO
        </button>
        <button
          type="button"
          className={lang === "en" ? "active" : ""}
          onClick={() => setLang("en")}
        >
          EN
        </button>
      </div>
    </nav>
  );
}
