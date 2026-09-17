"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { JournalIcon } from "@/components/JournalIcon";
import { isNavigationActive, primaryNavigation } from "@/lib/navigation";

export function Gnb() {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();

  return (
    <nav className="site-gnb" aria-label={lang === "ko" ? "전역 탐색" : "Global navigation"}>
      <Link className="brand-lockup" href="/" aria-label="TOPAI judgment journal home">
        <span className="brand-mark">AI</span>
        <span className="brand-copy">
          <strong>TOPAI</strong>
          <small>AI tool field notes</small>
        </span>
      </Link>
      <div className="nav-links" role="navigation" aria-label={lang === "ko" ? "주요 페이지" : "Primary pages"}>
        {primaryNavigation.map((item) => {
          const isActive = isNavigationActive(item, pathname);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`nav-link ${isActive ? "active" : ""}`}
              href={item.href}
              key={item.href}
            >
              <span className="nav-link-code" aria-hidden="true">
                <JournalIcon name={item.icon} />
                <small>{item.code}</small>
              </span>
              <span className="nav-link-copy">
                <strong>{item.label[lang]}</strong>
                <small>{item.summary[lang]}</small>
              </span>
            </Link>
          );
        })}
      </div>
      <div className="nav-actions">
        <Link className="nav-start-link" href="/search">
          {lang === "ko" ? "문제 입력" : "Start"}
        </Link>
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
      </div>
    </nav>
  );
}
