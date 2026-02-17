"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export function Gnb() {
  const { lang, setLang, t } = useLanguage();

  return (
    <nav>
      <Link href="/">
        <strong>g2</strong>
      </Link>
      <div className="nav-links">
        <Link href="/search">{t.navSearch}</Link>
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
