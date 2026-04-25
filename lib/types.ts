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

export type UserRole = "user" | "admin";

export type RequestActor = {
  id: string;
  nickname: string;
  role: UserRole;
};

export type UserReview = {
  id: string;
  toolId: string;
  nickname: string;
  line: string;
  detail: string;
  rating: number;
  createdAt: string;
};

export type PatchImpact = "low" | "medium" | "high";

export type PatchUpdate = {
  id: string;
  toolId: string;
  date: string;
  title: string;
  change: string;
  errorRisk: string;
  impact: PatchImpact;
  hasIncident: boolean;
  authorName: string;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  toolId: string;
  action: "create";
  resourceType: "user_review" | "patch_update";
  resourceId: string;
  actor: RequestActor;
  changes: Record<string, unknown>;
  createdAt: string;
};
