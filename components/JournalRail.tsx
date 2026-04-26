"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { JournalIcon } from "@/components/JournalIcon";
import { isNavigationActive, railNavigation } from "@/lib/navigation";

export function JournalRail() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  return (
    <aside className="journal-rail" aria-label={lang === "ko" ? "저널 작업대" : "Journal desk"}>
      <div className="rail-profile">
        <span className="rail-avatar" aria-hidden="true">
          AI
        </span>
        <div>
          <strong>TOPAI</strong>
          <span>{lang === "ko" ? "Judgment Tier" : "Scholarly Tier"}</span>
        </div>
      </div>
      <div className="rail-links" role="navigation" aria-label={lang === "ko" ? "저널 탐색" : "Journal navigation"}>
        {railNavigation.map((item) => {
          const isActive = isNavigationActive(item, pathname);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={isActive ? "active" : ""}
              href={item.href}
              key={`${item.href}-${item.code}`}
            >
              <span className="rail-icon" aria-hidden="true">
                <JournalIcon name={item.icon} />
              </span>
              <span className="rail-link-copy">
                <span>{item.label[lang]}</span>
                <small>{item.summary[lang]}</small>
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
