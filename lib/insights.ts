import type { ImpactScores, Tool } from "@/lib/types";
import type { PatchImpact } from "@/lib/types";

export type ScoreBreakdown = {
  functionality: number;
  uiux: number;
  reliability: number;
  comfort: number;
  pricing: number;
};

export type CapabilityComparison = {
  competitor: string;
  worksBetterHere: string;
  weakerHere: string;
};

export type PatchNote = {
  id?: string;
  toolId?: string;
  date: string;
  title: string;
  change: string;
  errorRisk: string;
  impact?: PatchImpact;
  hasIncident?: boolean;
  authorName?: string;
  createdAt?: string;
};

export type WorkPlaybook = {
  title: string;
  howToUse: string;
  recommendation: string;
};

export const impactDimensions = [
  "judgmentSpeed",
  "thinkingDepth",
  "executionDensity",
  "collaborationClarity"
] as const;

export type ImpactDimension = (typeof impactDimensions)[number];

export type SignalBenchmark = {
  peerCount: number;
  toolAverage: number;
  corpusAverage: number;
  overallRank: number;
  averages: ImpactScores;
  deltas: Record<ImpactDimension, number>;
  ranks: Record<ImpactDimension, number>;
  leaders: Record<ImpactDimension, { id: string; name: string; value: number }>;
  strongestDimension: ImpactDimension;
  softestDimension: ImpactDimension;
};

export type ToolInsight = {
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
  oneLine: string;
  comparisons: CapabilityComparison[];
  patchNotes: PatchNote[];
  workPlaybook: WorkPlaybook[];
};

const overrides: Record<string, Partial<ToolInsight>> = {
  "d41f50a2-3b7c-4f7e-8c73-1b8d0b0fe21a": {
    oneLine: "팀의 작업 체계를 한 곳으로 통합할 때 강력하지만, 운영 원칙이 약하면 빠르게 복잡해집니다."
  },
  "ef6b79b4-7c1e-4df0-95f1-9011f412e1cb": {
    oneLine: "빠른 협업에는 강하지만, 비동기 원칙이 없으면 깊은 몰입을 해치기 쉽습니다."
  }
};

const clamp = (score: number) => Math.max(0, Math.min(100, score));

const roundOne = (value: number) => Math.round(value * 10) / 10;

const averageImpact = (tool: Tool) =>
  roundOne(impactDimensions.reduce((sum, dimension) => sum + tool.impact[dimension], 0) / impactDimensions.length);

const deriveScoreBreakdown = (tool: Tool): ScoreBreakdown => ({
  functionality: clamp(tool.impact.executionDensity * 10 + 10),
  uiux: clamp(tool.impact.collaborationClarity * 10),
  reliability: clamp((10 - (tool.verdictBadges.lockinRisk ? 2 : 0)) * 8),
  comfort: clamp(tool.impact.thinkingDepth * 10),
  pricing: clamp(tool.verdictBadges.lockinRisk ? 55 : 72)
});

const deriveComparisons = (tool: Tool): CapabilityComparison[] => [
  {
    competitor: tool.alternatives[0] ?? "수작업 워크플로우",
    worksBetterHere: `${tool.name}는 "${tool.problemContexts[0] ?? "팀 운영"}" 같은 문제에서 맥락을 더 빠르게 모읍니다.`,
    weakerHere: `팀이 단순 체크리스트만 필요하다면 ${tool.name}는 다소 무겁게 느껴질 수 있습니다.`
  },
  {
    competitor: tool.alternatives[1] ?? "스프레드시트 + 문서",
    worksBetterHere: `${tool.name}는 이해관계자가 많을 때 단일 기준점(SSOT) 확보에 유리합니다.`,
    weakerHere: `더 단순한 조합 대비 ${tool.name}는 데이터 이식성이 떨어질 수 있습니다.`
  }
];

const derivePatchNotes = (tool: Tool): PatchNote[] => [
  {
    date: "2026-01-15",
    title: "워크스페이스 탐색 업데이트",
    change: "프로젝트 뷰와 저장 필터를 개선해 필요한 정보를 더 빠르게 찾을 수 있게 했습니다.",
    errorRisk: "기존 북마크 링크는 업데이트 전 화면을 열 수 있어 재저장이 필요할 수 있습니다."
  },
  {
    date: "2025-11-02",
    title: "권한 및 정책 변경",
    change: "감사 로그와 공유 경계 관리를 위한 관리자 제어 항목을 확장했습니다.",
    errorRisk: "권한 설정이 잘못되면 협업자가 핵심 페이지에 일시적으로 접근하지 못할 수 있습니다."
  }
];

const deriveWorkPlaybook = (tool: Tool): WorkPlaybook[] => [
  {
    title: "주간 의사결정 리뷰",
    howToUse: `${tool.name}에 제품/운영/고객 대응 팀의 핵심 결정을 주간 로그로 모아 기록하세요.`,
    recommendation: "매주 금요일 의사결정 요약 담당자를 고정하면 맥락 단절을 크게 줄일 수 있습니다."
  },
  {
    title: "실행 계획 리듬",
    howToUse: `${tool.name}에 우선순위, 담당자, 블로커를 연결한 반복 계획 보드를 운영하세요.`,
    recommendation: "활성 항목을 15개 이하로 유지하고, 완료 항목은 빠르게 아카이브해야 선명도가 유지됩니다."
  }
];

export const getToolInsight = (tool: Tool): ToolInsight => {
  const scoreBreakdown = deriveScoreBreakdown(tool);
  const totalScore = Math.round(
    (scoreBreakdown.functionality +
      scoreBreakdown.uiux +
      scoreBreakdown.reliability +
      scoreBreakdown.comfort +
      scoreBreakdown.pricing) /
      5
  );

  return {
    totalScore,
    scoreBreakdown,
    oneLine: `${tool.name}는 팀의 실행 속도를 높이지만, 인지 과부하를 막기 위한 사용 원칙이 반드시 필요합니다.`,
    comparisons: deriveComparisons(tool),
    patchNotes: derivePatchNotes(tool),
    workPlaybook: deriveWorkPlaybook(tool),
    ...overrides[tool.id]
  };
};

export const getToolSignalBenchmark = (tool: Tool, corpus: Tool[]): SignalBenchmark => {
  const peerCount = corpus.length;
  const sortedByAverage = [...corpus].sort((a, b) => averageImpact(b) - averageImpact(a));
  const overallRank = sortedByAverage.findIndex((item) => item.id === tool.id) + 1;
  const corpusAverage = roundOne(
    corpus.reduce((sum, item) => sum + averageImpact(item), 0) / Math.max(peerCount, 1)
  );

  const averages = impactDimensions.reduce((acc, dimension) => {
    acc[dimension] = roundOne(
      corpus.reduce((sum, item) => sum + item.impact[dimension], 0) / Math.max(peerCount, 1)
    );
    return acc;
  }, {} as ImpactScores);

  const deltas = impactDimensions.reduce((acc, dimension) => {
    acc[dimension] = roundOne(tool.impact[dimension] - averages[dimension]);
    return acc;
  }, {} as Record<ImpactDimension, number>);

  const ranks = impactDimensions.reduce((acc, dimension) => {
    const sorted = [...corpus].sort((a, b) => b.impact[dimension] - a.impact[dimension]);
    acc[dimension] = sorted.findIndex((item) => item.id === tool.id) + 1;
    return acc;
  }, {} as Record<ImpactDimension, number>);

  const leaders = impactDimensions.reduce((acc, dimension) => {
    const leader = [...corpus].sort((a, b) => b.impact[dimension] - a.impact[dimension])[0] ?? tool;
    acc[dimension] = {
      id: leader.id,
      name: leader.name,
      value: leader.impact[dimension]
    };
    return acc;
  }, {} as SignalBenchmark["leaders"]);

  const strongestDimension = [...impactDimensions].sort((a, b) => deltas[b] - deltas[a])[0];
  const softestDimension = [...impactDimensions].sort((a, b) => deltas[a] - deltas[b])[0];

  return {
    peerCount,
    toolAverage: averageImpact(tool),
    corpusAverage,
    overallRank,
    averages,
    deltas,
    ranks,
    leaders,
    strongestDimension,
    softestDimension
  };
};
