"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Gnb() {
  const { lang, setLang, t } = useLanguage();
  const pathname = usePathname();

  const links = [
    { href: "/search", label: t.navSearch },
    { href: "/community", label: t.navCommunity },
    { href: "/about", label: t.navAbout }
  ];

  return (
    <nav className="site-nav" aria-label={lang === "ko" ? "주요 메뉴" : "Primary"}>
      <Link className="brand-lockup" href="/" aria-label="g2 judgment journal home">
        <span className="brand-mark">g2</span>
        <span className="brand-copy">
          <strong>Judgment Journal</strong>
          <small>AI tool field notes</small>
        </span>
      </Link>
      <div className="nav-links">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      <div className="nav-utility">
        <div className="lang-switch" role="group" aria-label={lang === "ko" ? "언어 선택" : "Language"}>
          <button
            type="button"
            className={lang === "ko" ? "active" : ""}
            onClick={() => setLang("ko")}
            aria-pressed={lang === "ko"}
          >
            KO
          </button>
          <button
            type="button"
            className={lang === "en" ? "active" : ""}
            onClick={() => setLang("en")}
            aria-pressed={lang === "en"}
          >
            EN
          </button>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}
