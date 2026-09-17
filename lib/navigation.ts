import type { Language } from "@/lib/i18n";
import type { JournalIconName } from "@/components/JournalIcon";

type LocalizedText = Record<Language, string>;

export type NavigationItem = {
  href: string;
  code: string;
  icon: JournalIconName;
  label: LocalizedText;
  summary: LocalizedText;
  activePrefixes?: string[];
};

export const primaryNavigation: NavigationItem[] = [
  {
    href: "/search",
    code: "01",
    icon: "search",
    label: { ko: "탐색", en: "Explore" },
    summary: { ko: "문제에서 도구로", en: "Problem to tool" },
    activePrefixes: ["/tools"]
  },
  {
    href: "/compare",
    code: "02",
    icon: "compare",
    label: { ko: "비교", en: "Compare" },
    summary: { ko: "후보 압축", en: "Shortlist" }
  },
  {
    href: "/blog",
    code: "03",
    icon: "archive",
    label: { ko: "블로그", en: "Blog" },
    summary: { ko: "큐레이션 글", en: "Curation notes" },
    activePrefixes: ["/archive", "/rankings", "/trending"]
  },
  {
    href: "/community",
    code: "04",
    icon: "signals",
    label: { ko: "커뮤니티", en: "Community" },
    summary: { ko: "투표와 토론", en: "Votes and threads" }
  },
  {
    href: "/about",
    code: "05",
    icon: "method",
    label: { ko: "방법론", en: "Method" },
    summary: { ko: "판단 기준", en: "Judgment rules" }
  }
];

export const railNavigation: NavigationItem[] = [
  {
    href: "/",
    code: "JD",
    icon: "home",
    label: { ko: "저널 데스크", en: "Journal Desk" },
    summary: { ko: "대표 리뷰와 원칙", en: "Featured reviews" }
  },
  {
    href: "/search",
    code: "PF",
    icon: "search",
    label: { ko: "문제 탐색", en: "Problem Finder" },
    summary: { ko: "상황 기반 매칭", en: "Context matching" },
    activePrefixes: ["/tools"]
  },
  {
    href: "/compare",
    code: "CM",
    icon: "compare",
    label: { ko: "비교 매트릭스", en: "Comparison Matrix" },
    summary: { ko: "후보 압축과 트레이", en: "Shortlist and tray" }
  },
  {
    href: "/blog",
    code: "CB",
    icon: "archive",
    label: { ko: "큐레이션 블로그", en: "Curation Blog" },
    summary: { ko: "에디터 노트와 랭킹", en: "Editorial notes" },
    activePrefixes: ["/archive", "/rankings", "/trending"]
  },
  {
    href: "/community",
    code: "CS",
    icon: "signals",
    label: { ko: "레딧형 커뮤니티", en: "Reddit-style Community" },
    summary: { ko: "투표 기반 현장 토론", en: "Vote-led threads" }
  },
  {
    href: "/trending/github",
    code: "GH",
    icon: "github",
    label: { ko: "GitHub 신호", en: "GitHub Signals" },
    summary: { ko: "개발 이슈 추적", en: "Developer issues" }
  },
  {
    href: "/rankings/oss",
    code: "OR",
    icon: "ranking",
    label: { ko: "OSS 랭킹", en: "OSS Rankings" },
    summary: { ko: "성장/안정/혁신", en: "Growth signals" },
    activePrefixes: ["/rankings"]
  },
  {
    href: "/archive",
    code: "AR",
    icon: "archive",
    label: { ko: "아카이브", en: "Archive" },
    summary: { ko: "저널 기록", en: "Journal records" }
  },
  {
    href: "/about",
    code: "MT",
    icon: "method",
    label: { ko: "방법론", en: "Methodology" },
    summary: { ko: "선별 기준과 흐름", en: "Curation logic" }
  }
];

export function isNavigationActive(item: NavigationItem, pathname: string) {
  if (item.href === "/") {
    return pathname === "/";
  }

  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
    return true;
  }

  return item.activePrefixes?.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ?? false;
}
