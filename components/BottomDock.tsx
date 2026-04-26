"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { JournalIcon } from "@/components/JournalIcon";
import { useLanguage } from "@/components/LanguageProvider";
import { isNavigationActive, type NavigationItem } from "@/lib/navigation";

const bottomDockItems: NavigationItem[] = [
  {
    href: "/",
    code: "H",
    icon: "home",
    label: { ko: "홈", en: "Home" },
    summary: { ko: "저널", en: "Desk" }
  },
  {
    href: "/search",
    code: "S",
    icon: "search",
    label: { ko: "탐색", en: "Search" },
    summary: { ko: "검색", en: "Find" },
    activePrefixes: ["/tools"]
  },
  {
    href: "/compare",
    code: "C",
    icon: "compare",
    label: { ko: "비교", en: "Compare" },
    summary: { ko: "비교", en: "Compare" }
  },
  {
    href: "/blog",
    code: "N",
    icon: "archive",
    label: { ko: "블로그", en: "Blog" },
    summary: { ko: "글", en: "Blog" },
    activePrefixes: ["/archive", "/rankings", "/trending"]
  },
  {
    href: "/community",
    code: "U",
    icon: "signals",
    label: { ko: "커뮤", en: "Board" },
    summary: { ko: "토론", en: "Board" }
  }
];

export function BottomDock() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  return (
    <nav className="bottom-dock" aria-label={lang === "ko" ? "모바일 주요 탐색" : "Mobile primary navigation"}>
      {bottomDockItems.map((item) => {
        const active = isNavigationActive(item, pathname);

        return (
          <Link aria-current={active ? "page" : undefined} className={active ? "active" : ""} href={item.href} key={item.href}>
            <JournalIcon name={item.icon} />
            <span>{item.label[lang]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
