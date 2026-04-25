"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const railItems = [
  { href: "/search", code: "PF", ko: "Personal Flow", en: "Personal Flow" },
  { href: "/community", code: "IN", ko: "Insights", en: "Insights" },
  { href: "/search", code: "SV", ko: "Saved Thoughts", en: "Saved Thoughts" },
  { href: "/about", code: "MT", ko: "Methodology", en: "Methodology" }
];

export function JournalRail() {
  const { lang } = useLanguage();

  return (
    <aside className="journal-rail" aria-label={lang === "ko" ? "저널 작업대" : "Journal desk"}>
      <div className="rail-profile">
        <span className="rail-avatar" aria-hidden="true">
          g2
        </span>
        <div>
          <strong>Research Desk</strong>
          <span>{lang === "ko" ? "Judgment Tier" : "Scholarly Tier"}</span>
        </div>
      </div>
      <div className="rail-links" role="navigation" aria-label={lang === "ko" ? "저널 탐색" : "Journal navigation"}>
        {railItems.map((item, index) => (
          <Link className={index === 0 ? "active" : ""} href={item.href} key={`${item.href}-${item.code}`}>
            <span className="rail-icon" aria-hidden="true">
              {item.code}
            </span>
            <span>{lang === "ko" ? item.ko : item.en}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
