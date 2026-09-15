import type {
  CapabilityComparison,
  ScoreBreakdown,
  Tool,
  ToolEvaluation,
  WorkPlaybook
} from "@/lib/types";
import { evaluations } from "@/data/evaluations";

export type {
  CapabilityComparison,
  ExternalRating,
  PatchImpactLevel,
  PatchNote,
  ScoreBreakdown,
  SourceReference,
  ToolEvaluation,
  WorkPlaybook
} from "@/lib/types";

export type ToolInsight = ToolEvaluation & {
  totalScore: number;
  /** true면 외부 조사 기반 데이터, false면 임팩트 점수에서 자동 유도한 기본값 */
  isResearched: boolean;
};

const clamp = (score: number) => Math.max(0, Math.min(100, score));

export const computeTotalScore = (breakdown: ScoreBreakdown): number =>
  Math.round(
    (breakdown.functionality +
      breakdown.uiux +
      breakdown.reliability +
      breakdown.comfort +
      breakdown.pricing) /
      5
  );

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

export const getToolEvaluation = (toolId: string): ToolEvaluation | undefined => evaluations[toolId];

export const getToolInsight = (tool: Tool): ToolInsight => {
  const evaluation = evaluations[tool.id];
  if (evaluation) {
    return {
      ...evaluation,
      totalScore: computeTotalScore(evaluation.scoreBreakdown),
      isResearched: true
    };
  }

  const scoreBreakdown = deriveScoreBreakdown(tool);
  return {
    totalScore: computeTotalScore(scoreBreakdown),
    scoreBreakdown,
    oneLine: `${tool.name}는 팀의 실행 속도를 높이지만, 인지 과부하를 막기 위한 사용 원칙이 반드시 필요합니다.`,
    keyFeatures: [],
    pricingSummary: "",
    koreaNote: "",
    comparisons: deriveComparisons(tool),
    patchNotes: [],
    workPlaybook: deriveWorkPlaybook(tool),
    externalRatings: [],
    sources: [],
    researchedAt: "",
    isResearched: false
  };
};
