"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

const railItems = [
  { href: "/", code: "OV", ko: "저널 홈", en: "Overview" },
  { href: "/search", code: "PF", ko: "문제로 탐색", en: "Problem search" },
  { href: "/community", code: "IN", ko: "인사이트", en: "Insights" },
  { href: "/about", code: "MT", ko: "판단 방법론", en: "Methodology" }
];

export function JournalRail() {
  const { lang } = useLanguage();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href.split("?")[0];

  return (
    <aside className="journal-rail" aria-label={lang === "ko" ? "저널 작업대" : "Journal desk"}>
      <div className="rail-profile">
        <span className="rail-avatar" aria-hidden="true">
          g2
        </span>
        <div>
          <strong>Research Desk</strong>
          <span>{lang === "ko" ? "판단 티어" : "Scholarly Tier"}</span>
        </div>
      </div>
      <nav className="rail-links" aria-label={lang === "ko" ? "저널 탐색" : "Journal navigation"}>
        {railItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              className={active ? "active" : ""}
              href={item.href}
              key={`${item.href}-${item.code}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="rail-icon" aria-hidden="true">
                {item.code}
              </span>
              <span>{lang === "ko" ? item.ko : item.en}</span>
            </Link>
          );
        })}
      </nav>
      <p className="rail-footnote">
        {lang === "ko" ? "사람의 판단을 먼저, 기능은 그 다음." : "Judgment first, features second."}
      </p>
    </aside>
  );
}
