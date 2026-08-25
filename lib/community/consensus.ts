import type { ContributorContext, DissentDirection, FacetDissent } from "@/lib/community/types";

/**
 * 표본이 이 수보다 적으면 평균·비율을 만들지 않습니다.
 *
 * "4.5점 (2명)"은 거짓말에 가깝습니다. 표본이 작을 때는 요약보다 원본이 정보량이 많습니다.
 * 이건 UI 관례가 아니라 집계 함수에 박아둔 규칙입니다 —
 * P0에서 파생 점수를 지운 것과 같은 원칙입니다.
 */
export const MIN_SAMPLE = 3;

export type FacetConsensus =
  | { kind: "empty" }
  /** 표본이 적어 요약하지 않고 원본을 그대로 넘깁니다. */
  | { kind: "raw"; entries: FacetDissent[] }
  | {
      kind: "aggregate";
      total: number;
      agree: number;
      tooLow: number;
      tooHigh: number;
      /** 에디터 점수를 낮춰야 한다는 쪽이 우세한가 */
      leaning: DissentDirection | "split";
      entries: FacetDissent[];
    };

const countBy = (entries: FacetDissent[], direction: DissentDirection) =>
  entries.filter((entry) => entry.direction === direction).length;

export const buildFacetConsensus = (entries: FacetDissent[]): FacetConsensus => {
  // 맥락을 적지 않은 기여는 집계에서 제외합니다. 숨기지는 않되 요약의 근거로는 쓰지 않습니다.
  const counted = entries.filter((entry) => !entry.isEditor && Boolean(entry.context?.role));

  if (entries.length === 0) return { kind: "empty" };
  if (counted.length < MIN_SAMPLE) return { kind: "raw", entries };

  const agree = countBy(counted, "agree");
  const tooLow = countBy(counted, "too-low");
  const tooHigh = countBy(counted, "too-high");
  const top = Math.max(agree, tooLow, tooHigh);
  const tied = [agree, tooLow, tooHigh].filter((value) => value === top).length > 1;

  return {
    kind: "aggregate",
    total: counted.length,
    agree,
    tooLow,
    tooHigh,
    leaning: tied ? "split" : agree === top ? "agree" : tooLow === top ? "too-low" : "too-high",
    entries
  };
};

/**
 * 역할 간 불일치.
 *
 * 결정권자는 만족하는데 실무자는 불만인 도구는 전형적인 도입 실패 패턴입니다.
 * 평균 하나로는 절대 보이지 않기 때문에 따로 계산합니다.
 */
export type RoleSplit = {
  hasSplit: boolean;
  byRole: { role: ContributorContext["role"]; agree: number; disagree: number }[];
};

export const buildRoleSplit = (entries: FacetDissent[]): RoleSplit => {
  const counted = entries.filter((entry) => !entry.isEditor && Boolean(entry.context?.role));
  const roles = Array.from(new Set(counted.map((entry) => entry.context.role)));

  const byRole = roles.map((role) => {
    const forRole = counted.filter((entry) => entry.context.role === role);
    return {
      role,
      agree: forRole.filter((entry) => entry.direction === "agree").length,
      disagree: forRole.filter((entry) => entry.direction !== "agree").length
    };
  });

  // 어떤 역할은 대체로 동의하는데 다른 역할은 대체로 반대하는 경우에만 불일치로 봅니다.
  const leansAgree = byRole.filter((entry) => entry.agree > entry.disagree).length;
  const leansAgainst = byRole.filter((entry) => entry.disagree > entry.agree).length;

  return {
    hasSplit: counted.length >= MIN_SAMPLE && leansAgree > 0 && leansAgainst > 0,
    byRole
  };
};

/** 응답자 분포. 표본이 작을 때 평균 대신 보여주는 편이 정직합니다. */
export const buildDistribution = (entries: FacetDissent[]) => {
  const counted = entries.filter((entry) => !entry.isEditor && Boolean(entry.context?.role));
  const tally = <K extends string>(pick: (entry: FacetDissent) => K) => {
    const map = new Map<K, number>();
    counted.forEach((entry) => map.set(pick(entry), (map.get(pick(entry)) ?? 0) + 1));
    return Array.from(map.entries()).map(([key, count]) => ({ key, count }));
  };

  return {
    total: counted.length,
    byRole: tally((entry) => entry.context.role),
    byTeamSize: tally((entry) => entry.context.teamSize),
    byDuration: tally((entry) => entry.context.duration)
  };
};
