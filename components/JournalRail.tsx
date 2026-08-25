"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

/**
 * 좌측 레일.
 *
 * 이전 버전은 "Research Desk / Judgment Tier / Personal Flow / Saved Thoughts / Insights"로
 * 로그인·개인화·저장 기능을 암시했지만 전부 존재하지 않았고,
 * Personal Flow와 Saved Thoughts가 둘 다 /search로 갔으며,
 * 현재 위치와 무관하게 항상 첫 항목이 활성 표시됐습니다.
 *
 * 실제로 있는 화면만 남기고, 현재 경로를 기준으로 활성 상태를 표시합니다.
 */
const railItems = [
  { href: "/", code: "HM", ko: "홈", en: "Home" },
  { href: "/search", code: "FD", ko: "도구 찾기", en: "Find tools" },
  { href: "/community", code: "CM", ko: "커뮤니티", en: "Community" },
  { href: "/about", code: "MT", ko: "평가 기준", en: "Methodology" }
];

export function JournalRail() {
  const { lang } = useLanguage();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="journal-rail" aria-label={lang === "ko" ? "사이트 탐색" : "Site navigation"}>
      <div className="rail-profile">
        <span className="rail-avatar" aria-hidden="true">
          g2
        </span>
        <div>
          <strong>{lang === "ko" ? "판단 저널" : "Judgment Journal"}</strong>
          <span>{lang === "ko" ? "도구 도입 판단 기록" : "Tool adoption field notes"}</span>
        </div>
      </div>
      <nav className="rail-links" aria-label={lang === "ko" ? "주요 화면" : "Main sections"}>
        {railItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              className={active ? "active" : ""}
              href={item.href}
              key={item.href}
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
    </aside>
  );
}
