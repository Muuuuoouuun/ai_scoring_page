import type {
  CapabilityComparison,
  PatchNote,
  ScoreBreakdown,
  Tool,
  WorkPlaybook
} from "@/lib/types";

export type {
  CapabilityComparison,
  PatchNote,
  ScoreBreakdown,
  ScoreFacet,
  WorkPlaybook
} from "@/lib/types";

export type ToolInsight = {
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
  oneLine: string;
  comparisons: CapabilityComparison[];
  patchNotes: PatchNote[];
  workPlaybook: WorkPlaybook[];
};

export const SCORE_FACET_KEYS = [
  "functionality",
  "uiux",
  "reliability",
  "comfort",
  "pricing"
] as const;

/**
 * 총점은 다섯 항목의 평균입니다.
 *
 * 이전에는 여기서 임팩트 점수를 산술 변환해 다섯 항목을 만들어냈습니다.
 * 그 방식은 새 정보를 전혀 만들지 못하면서 정밀해 보이기만 했고,
 * 실제로 전체 도구가 60~72점 안에 몰려 선택에 아무 도움이 되지 않았습니다.
 * 이제 점수는 data/reviews.ts에 사람이 직접 적고, 여기서는 평균만 냅니다.
 */
export const getTotalScore = (scoreBreakdown: ScoreBreakdown): number =>
  Math.round(
    SCORE_FACET_KEYS.reduce((sum, key) => sum + scoreBreakdown[key].score, 0) /
      SCORE_FACET_KEYS.length
  );

export const getToolInsight = (tool: Tool): ToolInsight => ({
  totalScore: getTotalScore(tool.review.scoreBreakdown),
  scoreBreakdown: tool.review.scoreBreakdown,
  oneLine: tool.review.verdict,
  comparisons: tool.review.comparisons,
  patchNotes: tool.review.patchNotes,
  workPlaybook: tool.review.playbook
});
