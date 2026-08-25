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

/* ──────────────────────────────────────────────────────────────────────────
 * 도입 판단 정보 (P1)
 *
 * 기존 모델은 "이 도구가 어떤 도구인가"는 답했지만 결정권자가 회의에서 실제로 받는
 * 세 가지 질문에는 답하지 못했습니다.
 *   1. 우리 팀 규모에 맞는가 → teamFit
 *   2. 도입에 실제로 무엇을 지불하는가 → adoption(사람의 시간) · pricingModel(돈) · exitCost(나갈 때)
 *   3. 언제 사지 말아야 하는가 → doNotUseIf
 * 그리고 이 단정들을 믿을 근거 → reviewMeta
 * ────────────────────────────────────────────────────────────────────────── */

export type TeamSizeBand = "1-5" | "6-30" | "30+";
export type FitLevel = "fits" | "conditional" | "avoid";

export type TeamFit = {
  band: TeamSizeBand;
  fit: FitLevel;
  note: string;
};

export type AdoptionDifficulty = "low" | "medium" | "high";

export type AdoptionCost = {
  difficulty: AdoptionDifficulty;
  /** 첫 효용까지 */
  timeToValue: string;
  /** 규칙이 굳을 때까지. timeToValue와의 격차가 도입 실패의 실제 신호입니다. */
  timeToSettle: string;
  requiredOwner: string;
  firstMonthRisk: string;
};

export type PricingUnit = "per-seat" | "per-usage" | "flat" | "hybrid";

export type PricingModel = {
  unit: PricingUnit;
  entryCost: string;
  /** 비용이 튀는 조건. 도입 실패는 첫 견적이 아니라 갱신에서 터집니다. 확인된 게 없으면 빈 배열. */
  spikeTriggers: string[];
  freeTierReality: string;
  /** "YYYY-MM". 가격은 이 사이트에서 가장 빨리 틀려지는 데이터라 화면이 스스로 경고할 수 있게 합니다. */
  asOf: string;
};

export type ExitDifficulty = "easy" | "manageable" | "hard" | "trapped";

export type ExitCost = {
  difficulty: ExitDifficulty;
  /** 내보내면 실제로 뭐가 나오고 뭐가 깨지는가 */
  exportReality: string;
  whatYouLose: string;
  switchWindow: string;
};

export type EvidenceKind =
  | "hands-on"
  | "team-deployment"
  | "user-interview"
  | "vendor-doc"
  | "public-incident";

export type EvidenceSource = {
  kind: EvidenceKind;
  note: string;
};

export type ReviewMeta = {
  reviewedBy: string;
  /** "YYYY-MM-DD" */
  reviewedAt: string;
  usageContext: string;
  /** 최소 1개. 실사용과 공식 문서 인용은 화면에서 다른 무게로 보여야 합니다. */
  evidence: EvidenceSource[];
};
