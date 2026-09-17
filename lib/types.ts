export type Review = {
  id: string;
  toolId: string;
  userId: string;
  nickname: string;
  line: string;
  detail: string;
  rating: number;
  createdAt: string;
};

export type DiscussionReply = {
  id: string;
  discussionId: string;
  userId: string;
  nickname: string;
  content: string;
  createdAt: string;
};

export type Discussion = {
  id: string;
  toolId: string;
  userId: string;
  nickname: string;
  title: string;
  content: string;
  replies: DiscussionReply[];
  createdAt: string;
};

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
  /** 이 조건이면 사지 마세요. 결정권자가 가장 먼저 하는 건 고르기가 아니라 떨어뜨리기입니다. */
  doNotUseIf: string[];
  /** 세 구간 전부 필수. 같은 도구가 5인에서 정답이고 50인에서 재앙인 경우가 흔합니다. */
  teamFit: [TeamFit, TeamFit, TeamFit];
  adoption: AdoptionCost;
  pricingModel: PricingModel;
  exitCost: ExitCost;
  reviewMeta: ReviewMeta;
};

export type Tool = {
  id: string;
  name: string;
  description: string;
  /** 이 도구가 걸리는 문제 태그 id 목록. data/problem-angles.ts에 태그별 문장이 있습니다. */
  problemTagIds: string[];
  whyExist: string;
  bestCase: string;
  worstCase: string;
  verdictBadges: VerdictBadges;
  alternatives: string[];
  review: ToolReview;
  createdAt: string;
  updatedAt: string;
};

export type UserReview = {
  id: string;
  toolId: string;
  nickname: string;
  line: string;
  detail?: string;
  rating: number;
  imageUrl?: string;
  // 신뢰도 메타 (커뮤니티 가중치용)
  role?: string;
  teamSize?: string;
  usagePeriod?: string;
  createdAt: string;
};

export type PatchUpdate = {
  id: string;
  toolId: string;
  title: string;
  change: string;
  errorRisk: string;
  authorId?: string;
  patchDate: string;
  impact?: "high" | "medium" | "low";
  isOutage?: boolean;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  actorId: string;
  action: "CREATE_REVIEW" | "CREATE_PATCH_NOTE";
  resourceType: string;
  resourceId: string;
  payload?: unknown;
  createdAt: string;
};
