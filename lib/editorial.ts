import type { Language } from "@/lib/i18n";
import type { Tool } from "@/lib/types";

export const getToolSignalScore = (tool: Tool) =>
  Math.round(
    (Object.values(tool.impact).reduce((sum, value) => sum + value, 0) / Object.values(tool.impact).length) * 10
  ) / 10;

export const comparisonDimensions = [
  {
    id: "judgmentSpeed",
    label: { ko: "판단 속도", en: "Judgment speed" },
    short: { ko: "속도", en: "Speed" }
  },
  {
    id: "thinkingDepth",
    label: { ko: "사고 깊이", en: "Thinking depth" },
    short: { ko: "깊이", en: "Depth" }
  },
  {
    id: "executionDensity",
    label: { ko: "실행 밀도", en: "Execution density" },
    short: { ko: "실행", en: "Execution" }
  },
  {
    id: "collaborationClarity",
    label: { ko: "협업 명확성", en: "Collaboration clarity" },
    short: { ko: "협업", en: "Clarity" }
  }
] as const;

export type ComparisonDimension = (typeof comparisonDimensions)[number]["id"];

export const compareCapabilityOptions = [
  {
    id: "timeSaver",
    label: { ko: "시간 절약", en: "Time saver" }
  },
  {
    id: "thinkCarefully",
    label: { ko: "도입 주의", en: "Needs governance" }
  },
  {
    id: "lockinRisk",
    label: { ko: "락인 점검", en: "Lock-in check" }
  },
  {
    id: "githubProject",
    label: { ko: "OSS/GitHub", en: "OSS/GitHub" }
  }
] as const;

export const getWeightedToolScore = (tool: Tool, weights: Record<ComparisonDimension, number>) => {
  const totalWeight = comparisonDimensions.reduce((sum, dimension) => sum + weights[dimension.id], 0);
  const weighted =
    comparisonDimensions.reduce((sum, dimension) => {
      return sum + tool.impact[dimension.id] * weights[dimension.id];
    }, 0) / Math.max(totalWeight, 1);

  return Math.round(weighted * 10) / 10;
};

export const getOssRankingRows = (tools: Tool[]) => {
  const ossTools = tools.filter((tool) => tool.genres.includes("githubProject"));
  const source = ossTools.length >= 3 ? ossTools : tools;

  return source
    .map((tool) => {
      const growth = Math.round((tool.impact.executionDensity * 8 + tool.impact.judgmentSpeed * 6) / 1.4);
      const stability = Math.round(
        (tool.impact.collaborationClarity * 7 + (tool.verdictBadges.lockinRisk ? 45 : 70)) / 1.4
      );
      const innovation = Math.round((tool.impact.thinkingDepth * 7 + tool.impact.executionDensity * 7) / 1.4);
      const total = Math.round((growth + stability + innovation) / 3);

      return {
        tool,
        growth,
        stability,
        innovation,
        total,
        activeDiscourses: Math.round(tool.impact.judgmentSpeed * 9 + tool.impact.collaborationClarity * 4)
      };
    })
    .sort((a, b) => b.total - a.total);
};

export const getGithubSignalThreads = (tools: Tool[], lang: Language) =>
  tools
    .filter((tool) => tool.genres.includes("githubProject") || tool.genres.includes("ai"))
    .slice(0, 5)
    .map((tool, index) => ({
      id: `${tool.id}-github-signal`,
      tool,
      repo: `${tool.name.toLowerCase().replace(/\s+/g, "-")}/signal-core`,
      title:
        lang === "ko"
          ? `${tool.name} 도입 이슈: 자동화 속도와 검토 품질의 균형`
          : `${tool.name} adoption issue: balancing automation speed with review quality`,
      summary:
        lang === "ko"
          ? `${tool.problemContexts[0]} 상황에서 반복 신호는 강하지만, 운영 경계와 책임자를 먼저 정해야 합니다.`
          : `Strong repeat signals for "${tool.problemContexts[0]}", but ownership and rollout limits should be set first.`,
      state: index % 2 === 0 ? "active" : "watching",
      comments: 18 + tool.impact.collaborationClarity * 3,
      heat: getToolSignalScore(tool)
    }));

export type ArchiveEntry = {
  id: string;
  title: Record<Language, string>;
  summary: Record<Language, string>;
  tag: Record<Language, string>;
  signal: number;
};

export const journalArchiveEntries: ArchiveEntry[] = [
  {
    id: "ethics-synthetic-work",
    title: {
      ko: "자동화가 판단을 대체하기 시작할 때",
      en: "When automation starts replacing judgment"
    },
    summary: {
      ko: "도구가 시간을 아껴주는 순간과 팀의 사고 근육을 약하게 만드는 순간을 분리합니다.",
      en: "Separating the moments when tools save time from the moments they weaken the team's thinking muscle."
    },
    tag: { ko: "운영 윤리", en: "Operational ethics" },
    signal: 92
  },
  {
    id: "benchmarking-beyond-benchmarks",
    title: {
      ko: "벤치마크 너머의 벤치마킹",
      en: "Benchmarking beyond benchmarks"
    },
    summary: {
      ko: "정량 점수만으로는 보이지 않는 온보딩, 회복력, 맥락 이동 비용을 읽는 방법입니다.",
      en: "A way to read onboarding, resilience, and context-switching costs that raw scores miss."
    },
    tag: { ko: "평가 방법", en: "Methodology" },
    signal: 88
  },
  {
    id: "library-of-workflows",
    title: {
      ko: "워크플로우 아카이브 설계",
      en: "Designing the workflow archive"
    },
    summary: {
      ko: "성공 사례보다 실패 패턴을 먼저 모으면 도구 선택이 더 빨라집니다.",
      en: "Tool decisions get faster when failure patterns are captured before success stories."
    },
    tag: { ko: "실무 플레이북", en: "Work playbook" },
    signal: 84
  }
];
