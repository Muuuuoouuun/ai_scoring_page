export type ImpactScores = {
  judgmentSpeed: number;
  thinkingDepth: number;
  executionDensity: number;
  collaborationClarity: number;
};

export type VerdictBadges = {
  timeSaver: boolean;
  thinkCarefully: boolean;
  lockinRisk: boolean;
};

/**
 * 점수는 계산으로 만들지 않습니다.
 * 항목마다 실제 값과 그 값을 준 근거를 함께 적습니다.
 * 근거 없는 점수는 신뢰를 만들지 못하기 때문에 reason은 필수입니다.
 */
export type ScoreFacet = {
  score: number;
  reason: string;
};

export type ScoreBreakdown = {
  functionality: ScoreFacet;
  uiux: ScoreFacet;
  reliability: ScoreFacet;
  comfort: ScoreFacet;
  pricing: ScoreFacet;
};

export type CapabilityComparison = {
  competitor: string;
  worksBetterHere: string;
  weakerHere: string;
};

/** 패치가 실무에 주는 충격의 크기 */
export type PatchImpact = "high" | "medium" | "low";

export type PatchNote = {
  date: string;
  title: string;
  change: string;
  errorRisk: string;
  impact: PatchImpact;
};

export type WorkPlaybook = {
  title: string;
  howToUse: string;
  recommendation: string;
};

/** 도구마다 직접 작성하는 리뷰 본문. 어떤 필드도 다른 도구와 공유되지 않습니다. */
export type ToolReview = {
  verdict: string;
  scoreBreakdown: ScoreBreakdown;
  comparisons: CapabilityComparison[];
  patchNotes: PatchNote[];
  playbook: WorkPlaybook[];
};

export type Tool = {
  id: string;
  name: string;
  description: string;
  problemContexts: string[];
  whyExist: string;
  impact: ImpactScores;
  bestCase: string;
  worstCase: string;
  verdictBadges: VerdictBadges;
  alternatives: string[];
  review: ToolReview;
  createdAt: string;
  updatedAt: string;
};
