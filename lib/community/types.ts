import type { ScoreBreakdown, TeamSizeBand } from "@/lib/types";

export type ScoreFacetKey = keyof ScoreBreakdown;

/**
 * 기여자의 "신원"이 아니라 "서 있는 위치"를 받습니다.
 *
 * 같은 5점이라도 3인 팀 창업자의 5점과 500인 회사 IT 담당자의 5점은 다른 정보입니다.
 * 실명을 요구해도 이 문제는 풀리지 않습니다. 위치는 로그인 없이도 받을 수 있고
 * 프라이버시 비용도 훨씬 쌉니다.
 *
 * 세 항목 모두 선택지형입니다. 자유 입력이면 필터·분해·집계가 전부 불가능해집니다.
 */
export type ContributorRole = "practitioner" | "team-lead" | "decision-maker" | "admin" | "solo";
/**
 * 리뷰의 teamFit(TeamSizeBand)과 같은 구간을 씁니다.
 * 두 벌을 두면 화면에서 "10~49인"과 "6~30인"이 동시에 보여 사용자가 혼란스럽고,
 * 기여자 응답을 리뷰의 적합도 판정과 대조할 수도 없습니다.
 */
export type TeamSizeBucket = TeamSizeBand;
export type UsageDuration = "evaluated-only" | "under-1m" | "1-6m" | "6m-2y" | "2y+";

export const CONTRIBUTOR_ROLES: ContributorRole[] = [
  "practitioner",
  "team-lead",
  "decision-maker",
  "admin",
  "solo"
];
export const TEAM_SIZE_BUCKETS: TeamSizeBucket[] = ["1-5", "6-30", "30+"];
export const USAGE_DURATIONS: UsageDuration[] = [
  "evaluated-only",
  "under-1m",
  "1-6m",
  "6m-2y",
  "2y+"
];

export type ContributorContext = {
  role: ContributorRole;
  teamSize: TeamSizeBucket;
  duration: UsageDuration;
};

/**
 * 항목별 반박.
 *
 * 빈 게시판에는 쓸 말이 없지만, 화면에 이미 "안정성 62점"이 근거와 함께 떠 있으면
 * "그 62점은 틀렸다"라고 쓸 말이 생깁니다. 인지 부하가 가장 낮은 첫 기여이고,
 * 동시에 에디터 점수와 사용자 판단을 병기하는 입력이 됩니다.
 */
export type DissentDirection = "agree" | "too-low" | "too-high";

/**
 * 반박에 요구하는 최소 근거 길이.
 *
 * 이 값은 세 곳에서 같아야 합니다:
 *   - lib/community/validators.ts (API 입력 검증)
 *   - MemoryCommunityStore (개발용 저장소)
 *   - db/community.sql 의 dissent_needs_reason 제약
 * 한 곳만 느슨하면 개발에서 통과한 데이터가 운영에서 거부됩니다.
 */
export const MIN_DISSENT_REASON = 20;

export class DissentReasonRequired extends Error {
  constructor() {
    super(`반박에는 ${MIN_DISSENT_REASON}자 이상의 근거가 필요합니다.`);
    this.name = "DissentReasonRequired";
  }
}

export type FacetDissent = {
  id: string;
  toolId: string;
  facet: ScoreFacetKey;
  direction: DissentDirection;
  /** 반박에는 근거를 요구합니다. 에디터에게 reason을 강제한 규칙을 사용자에게도 똑같이 적용합니다. */
  reason: string;
  authorHandle: string;
  isEditor: boolean;
  context: ContributorContext;
  createdAt: string;
};

/**
 * 도입 결정 기록.
 *
 * "별점 4.5"는 아무것도 알려주지 않지만 "10~49인 팀이 Airtable 대신 Notion을 골랐고
 * 8개월 뒤 축소했다"는 판단을 바꿉니다. 비교 데이터·이탈 데이터·시간축 데이터를
 * 한 번에 만듭니다.
 */
export type DecisionOutcome = "still-using" | "reduced" | "stopped";

export type DecisionRecord = {
  id: string;
  toolId: string;
  consideredAlternatives: string[];
  whyChosen: string;
  /** "YYYY-MM" */
  adoptedAt: string;
  outcome: DecisionOutcome;
  authorHandle: string;
  isEditor: boolean;
  context: ContributorContext;
  createdAt: string;
  /** 마지막으로 "지금도 쓰나요"에 답한 시점. 리뷰가 썩는 걸 막는 루프입니다. */
  checkedAt: string;
};

/**
 * 고장 제보.
 *
 * 신뢰의 원천은 좋은 소식이 아니라 나쁜 소식입니다. 검수를 거쳐 도구의 변경 이력으로
 * 승격되며 제보자 크레딧이 붙습니다. 바로 공개되지 않습니다.
 */
export type BreakageStatus = "pending" | "published" | "rejected";

export type BreakageReport = {
  id: string;
  toolId: string;
  /** "YYYY-MM" */
  occurredAt: string;
  whatBroke: string;
  workaround: string;
  status: BreakageStatus;
  authorHandle: string;
  createdAt: string;
};

/**
 * 저장소에 넘기는 저자 신원.
 *
 * 토큰 원본은 절대 저장하지 않고 해시만 남깁니다. 표시 이름(handle)은 토큰에서
 * 결정론적으로 파생되므로 사람이 고르는 값이 아니고, 사칭이 불가능합니다.
 * 나중에 이메일·OAuth를 붙일 때 tokenHash로 기존 익명 기여를 계정에 연결합니다.
 */
export type AuthorIdentity = {
  tokenHash: string;
  handle: string;
};

type WithAuthor<T> = Omit<T, "authorHandle"> & { author: AuthorIdentity };

export type NewFacetDissent = WithAuthor<Omit<FacetDissent, "id" | "createdAt">>;
export type NewDecisionRecord = WithAuthor<Omit<DecisionRecord, "id" | "createdAt" | "checkedAt">>;
export type NewBreakageReport = WithAuthor<Omit<BreakageReport, "id" | "createdAt" | "status">>;
