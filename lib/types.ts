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
