"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export function AppFooter() {
  const { lang, t } = useLanguage();

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">
            g2
          </span>
          <div>
            <strong>Judgment Journal</strong>
            <p>{t.footer}</p>
          </div>
        </div>
        <nav className="footer-links" aria-label={lang === "ko" ? "푸터 메뉴" : "Footer"}>
          <Link href="/search">{t.navSearch}</Link>
          <Link href="/community">{t.navCommunity}</Link>
          <Link href="/about">{t.navAbout}</Link>
        </nav>
      </div>
      <p className="footer-meta">
        <span>© {new Date().getFullYear()} g2</span>
        <span>{lang === "ko" ? "판단 우선 리뷰 저널" : "A judgment-first review journal"}</span>
      </p>
    </footer>
  );
}
