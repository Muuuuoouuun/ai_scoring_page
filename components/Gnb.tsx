"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { useEffect, useState } from "react";
import type { PublicUser } from "@/lib/auth";

export function Gnb() {
  const { lang, setLang, t } = useLanguage();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <nav>
      <Link className="brand-lockup" href="/" aria-label={`${brand.name} 홈`}>
        <span className="brand-mark">{brand.name}</span>
        <span className="brand-copy">
          <strong>{brand.tagline}</strong>
        </span>
      </Link>
      <div className="nav-links">
        <Link href="/search">{t.navSearch}</Link>
        <Link href="/community">{t.navCommunity}</Link>
        <Link href="/compare">{lang === "ko" ? "비교" : "Compare"}</Link>
        <Link href="/beginners">{lang === "ko" ? "입문자 가이드" : "Beginners"}</Link>
        <Link href="/about">{t.navAbout}</Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div className="lang-switch" aria-label="Language switch">
          <button type="button" className={lang === "ko" ? "active" : ""} onClick={() => setLang("ko")}>
            KO
          </button>
          <button type="button" className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>
            EN
          </button>
        </div>

        {user ? (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="secondary-button"
              style={{ fontSize: "0.85rem" }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              @{user.nickname}
              {user.role === "admin" && (
                <span style={{ marginLeft: "0.25rem", fontSize: "0.7rem", color: "var(--accent)" }}>ADMIN</span>
              )}
            </button>
            {menuOpen && (
              <div className="user-dropdown">
                {user.role === "admin" && (
                  <Link href="/admin" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    {lang === "ko" ? "어드민 대시보드" : "Admin Dashboard"}
                  </Link>
                )}
                <Link href="/community/rank" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                  {lang === "ko" ? "커뮤니티 랭크" : "Community Rank"}
                </Link>
                <button type="button" className="dropdown-item" onClick={handleLogout}>
                  {lang === "ko" ? "로그아웃" : "Logout"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="button" style={{ fontSize: "0.85rem", padding: "0.4rem 0.9rem" }}>
            {lang === "ko" ? "로그인" : "Login"}
          </Link>
        )}
      </div>
    </nav>
  );
}
