"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

/**
 * 좌측 레일.
 *
 * 이전 버전은 "Research Desk / Personal Flow / Saved Thoughts / Insights"로
 * 로그인·개인화·저장 기능을 암시했지만 전부 존재하지 않았고,
 * 두 항목이 같은 경로로 갔으며, 현재 위치와 무관하게 항상 첫 항목이 활성이었습니다.
 * 실제로 있는 화면만 남기고 경로 기준으로 활성 상태를 계산합니다.
 * 라벨은 GNB와 같은 문자열을 씁니다 — 같은 목적지를 두 이름으로 부르면
 * 두 개의 다른 화면이 있는 것처럼 읽힙니다.
 *
 * 상단의 프로필 블록(38px 아바타 + 브랜드명 + 태그라인)은 제거했습니다.
 * 로그인이 없는 사이트에서 아바타는 없는 기능을 암시했고, 바로 위 GNB가
 * 같은 브랜드 락업을 이미 더 큰 크기로 보여주고 있었습니다.
 */
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
