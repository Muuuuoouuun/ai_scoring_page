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
