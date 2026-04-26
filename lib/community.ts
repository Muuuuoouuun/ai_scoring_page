import type { Tool, ToolGenre } from "@/lib/types";

export type CommunityPost = {
  id: string;
  toolId?: string;
  toolName?: string;
  title: string;
  body: string;
  author: string;
  genre: ToolGenre;
  votes: number;
  comments: number;
  age: string;
  flair: string;
  status: "hot" | "new" | "answered" | "debate";
};

export type ToolDiscussion = {
  id: string;
  title: string;
  stance: "pro" | "con" | "mixed";
  summary: string;
  votes: number;
  comments: number;
  tags: string[];
};

export const communityPosts: CommunityPost[] = [
  {
    id: "post-ai-ops",
    title: "AI 도구 도입 전, 법무/보안 검토를 어디까지 하시나요?",
    body: "생산성은 좋아졌는데 고객 데이터가 섞이는 순간 리스크가 커집니다. 팀별 승인 기준을 공유해 주세요.",
    author: "@ops_jin",
    genre: "ai",
    votes: 186,
    comments: 42,
    age: "2h",
    flair: "도입 판단",
    status: "hot"
  },
  {
    id: "post-linear-github",
    toolId: "f33e7f82-0d1c-4f57-9c5f-9a8e8e251e88",
    toolName: "Linear",
    title: "GitHub Projects에서 Linear로 넘어갈 때 잃는 것과 얻는 것",
    body: "개발팀은 GitHub에 남고 제품팀은 Linear를 원합니다. 이중 관리 비용을 줄이는 기준이 궁금합니다.",
    author: "@dev_mark",
    genre: "githubProject",
    votes: 121,
    comments: 28,
    age: "5h",
    flair: "비교 요청",
    status: "debate"
  },
  {
    id: "post-saas-sprawl",
    title: "SaaS 구독이 40개를 넘으면 어떤 기준으로 정리하시나요?",
    body: "사용률보다 중요한 건 데이터 중복과 권한 경계였습니다. 여러분은 폐기 기준을 어떻게 잡나요?",
    author: "@finance_pm",
    genre: "saas",
    votes: 98,
    comments: 31,
    age: "8h",
    flair: "운영 비용",
    status: "answered"
  },
  {
    id: "post-it-handoff",
    title: "IT 운영 인수인계 문서, 어디까지 자동화해야 할까요?",
    body: "자동화가 많아질수록 신규 담당자는 더 모르더군요. 사람이 읽는 문서와 자동 실행의 균형점을 찾고 있습니다.",
    author: "@infra_lee",
    genre: "it",
    votes: 74,
    comments: 19,
    age: "1d",
    flair: "운영 노하우",
    status: "new"
  },
  {
    id: "post-replit",
    toolId: "e357c35d-bfd4-4c14-aad0-9910de98837f",
    toolName: "Replit",
    title: "브라우저 IDE가 온보딩 시간을 줄였지만, 리뷰 품질은 낮아졌습니다",
    body: "프로토타입은 빨라졌는데 설계 토론이 줄었습니다. Replit류 도구를 교육용과 실무용으로 나누는 기준이 필요해 보여요.",
    author: "@build_hana",
    genre: "ai",
    votes: 63,
    comments: 17,
    age: "1d",
    flair: "현장 리뷰",
    status: "debate"
  }
];

export const getToolDiscussions = (tool: Tool): ToolDiscussion[] => [
  {
    id: `${tool.id}-governance`,
    title: `${tool.name} 도입 전에 합의해야 할 운영 원칙은?`,
    stance: "mixed",
    summary: "도구 자체보다 권한, 정리 리듬, 책임자의 존재가 성공/실패를 가르는 쟁점입니다.",
    votes: Math.round(tool.impact.collaborationClarity * 12),
    comments: 18,
    tags: ["운영", "권한", "도입 기준"]
  },
  {
    id: `${tool.id}-best-fit`,
    title: `${tool.name}가 가장 잘 맞는 팀 규모는 어디까지인가요?`,
    stance: tool.verdictBadges.lockinRisk ? "con" : "pro",
    summary: tool.verdictBadges.lockinRisk
      ? "확장될수록 데이터 이동 비용이 커질 수 있어 도입 초기부터 출구 전략이 필요합니다."
      : "운영 복잡도가 낮은 팀에서는 빠르게 표준 업무 흐름을 만들 수 있습니다.",
    votes: Math.round(tool.impact.judgmentSpeed * 10),
    comments: 12,
    tags: ["팀 규모", "락인", "확장성"]
  },
  {
    id: `${tool.id}-workflow`,
    title: `실무에서 ${tool.name}를 대체하거나 보완하는 조합은?`,
    stance: "pro",
    summary: `${tool.alternatives[0] ?? "기존 워크플로우"}와 비교했을 때 어디까지 맡기고 어디서 끊을지가 핵심입니다.`,
    votes: Math.round(tool.impact.executionDensity * 11),
    comments: 9,
    tags: ["대안", "워크플로우", "비교"]
  }
];

export const getToolCommunityPosts = (tool: Tool) =>
  communityPosts.filter((post) => post.toolId === tool.id || tool.genres.includes(post.genre)).slice(0, 4);
