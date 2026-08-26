"use client";

import Link from "next/link";
import { brand } from "@/lib/brand";
import { copy as t } from "@/lib/copy";

export function Gnb() {
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
        <Link href="/about">{t.navAbout}</Link>
      </div>
    </nav>
  );
}
