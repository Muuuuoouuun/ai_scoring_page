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

export type ToolGenre = "ai" | "it" | "githubProject" | "saas";

export type Tool = {
  id: string;
  name: string;
  description: string;
  genres: ToolGenre[];
  problemContexts: string[];
  whyExist: string;
  bestCase: string;
  worstCase: string;
  verdictBadges: VerdictBadges;
  alternatives: string[];
  review: ToolReview;
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
