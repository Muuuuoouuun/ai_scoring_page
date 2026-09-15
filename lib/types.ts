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
  /** 예: "AI 어시스턴트", "워크스페이스 / 문서" */
  category?: string;
  /** 공식 사이트 URL */
  website?: string;
  createdAt: string;
  updatedAt: string;
};

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

export type PatchImpactLevel = "high" | "medium" | "low";

export type PatchNote = {
  date: string;
  title: string;
  change: string;
  errorRisk: string;
  impactLevel?: PatchImpactLevel;
};

export type WorkPlaybook = {
  title: string;
  howToUse: string;
  recommendation: string;
};

/** G2, Capterra, Product Hunt 등 외부 리뷰 사이트 점수 */
export type ExternalRating = {
  source: string;
  score: string;
  note?: string;
  url?: string;
};

export type SourceReference = {
  label: string;
  url: string;
};

/**
 * 편집팀이 공식 체인지로그, 가격 페이지, 외부 리뷰 사이트를 조사해 채운 도구별 평가 데이터.
 * data/evaluations.ts 에 도구 id 기준으로 저장됩니다.
 */
export type ToolEvaluation = {
  oneLine: string;
  scoreBreakdown: ScoreBreakdown;
  keyFeatures: string[];
  pricingSummary: string;
  koreaNote?: string;
  comparisons: CapabilityComparison[];
  patchNotes: PatchNote[];
  workPlaybook: WorkPlaybook[];
  externalRatings: ExternalRating[];
  sources: SourceReference[];
  /** 조사 기준 시점, 예: "2026-09" */
  researchedAt: string;
};
