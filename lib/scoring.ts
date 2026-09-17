import type { ExternalRating, ScoreBreakdown } from "@/lib/types";

/** 편집 점수 가중치: 안정성과 기능 완성도를 가장 크게, 가격 합리성을 그다음으로 봅니다. */
export const SCORE_WEIGHTS: Record<keyof ScoreBreakdown, number> = {
  functionality: 0.25,
  uiux: 0.15,
  reliability: 0.25,
  comfort: 0.15,
  pricing: 0.2
};

/** 종합 점수 = 편집 점수 70% + 외부 사이트 평가 30% (외부 평가가 없으면 편집 점수 100%) */
export const COMPOSITE_WEIGHTS = { editorial: 0.7, external: 0.3 };

/** 외부 리뷰 사이트별 신뢰 가중치. Trustpilot은 결제 불만 편향이 커서 낮게 봅니다. */
const SOURCE_WEIGHTS: Array<[RegExp, number]> = [
  [/\bg2\b/i, 1],
  [/capterra/i, 1],
  [/trustradius/i, 1],
  [/getapp|software advice/i, 0.9],
  [/product\s*hunt/i, 0.8],
  [/app\s*store|google\s*play|play\s*store/i, 0.8],
  [/chrome\s*web\s*store|vs\s*code\s*marketplace/i, 0.7],
  [/trustpilot/i, 0.5]
];
const DEFAULT_SOURCE_WEIGHT = 0.6;

export const sourceWeight = (source: string): number => {
  const match = SOURCE_WEIGHTS.find(([pattern]) => pattern.test(source));
  return match ? match[1] : DEFAULT_SOURCE_WEIGHT;
};

export type ParsedRating = { value: number; scale: number; normalized: number };

/** "4.7/5", "9.1/10", "92/100", "82%", "4.7" 형태의 점수 문자열을 0~100 점으로 정규화합니다. 해석 불가하면 null. */
export const parseRatingScore = (score: string): ParsedRating | null => {
  const text = score.trim();
  const fraction = text.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  let value: number | null = null;
  let scale: number | null = null;

  if (fraction) {
    value = Number(fraction[1]);
    scale = Number(fraction[2]);
  } else {
    const percent = text.match(/^(\d+(?:\.\d+)?)\s*%/);
    const single = text.match(/^(\d+(?:\.\d+)?)(?:\s*(?:점|stars?|★))?$/i);
    if (percent) {
      value = Number(percent[1]);
      scale = 100;
    } else if (single) {
      value = Number(single[1]);
      scale = value <= 5 ? 5 : value <= 10 ? 10 : 100;
    }
  }

  if (value === null || scale === null || !Number.isFinite(value) || !Number.isFinite(scale)) return null;
  if (scale <= 0 || value < 0 || value > scale) return null;
  return { value, scale, normalized: Math.round((value / scale) * 1000) / 10 };
};

export const computeEditorialScore = (breakdown: ScoreBreakdown): number => {
  const total = (Object.keys(SCORE_WEIGHTS) as Array<keyof ScoreBreakdown>).reduce(
    (sum, key) => sum + breakdown[key] * SCORE_WEIGHTS[key],
    0
  );
  return Math.round(total);
};

export type ExternalScoreDetail = {
  source: string;
  score: string;
  normalized: number;
  weight: number;
};

export type ExternalScore = {
  score: number;
  count: number;
  details: ExternalScoreDetail[];
};

/** 외부 사이트 평가를 가중 평균해 0~100 점으로 만듭니다. 해석 불가한 항목(설문 재인용, 리뷰 수 등)은 제외합니다. */
export const computeExternalScore = (ratings: ExternalRating[]): ExternalScore | null => {
  const details: ExternalScoreDetail[] = [];
  for (const rating of ratings) {
    const parsed = parseRatingScore(rating.score);
    if (!parsed) continue;
    details.push({
      source: rating.source,
      score: rating.score,
      normalized: parsed.normalized,
      weight: sourceWeight(rating.source)
    });
  }
  if (details.length === 0) return null;
  const weightSum = details.reduce((sum, item) => sum + item.weight, 0);
  const weighted = details.reduce((sum, item) => sum + item.normalized * item.weight, 0);
  return { score: Math.round(weighted / weightSum), count: details.length, details };
};

export const computeCompositeScore = (editorial: number, external: number | null): number => {
  if (external === null) return editorial;
  return Math.round(editorial * COMPOSITE_WEIGHTS.editorial + external * COMPOSITE_WEIGHTS.external);
};

/** 0~100 점을 0~5 별점(소수 첫째 자리)으로 바꿉니다. */
export const scoreToStars = (score: number): number => Math.round((Math.max(0, Math.min(100, score)) / 20) * 10) / 10;

export type ScoreTierKey = "strong" | "recommended" | "conditional" | "caution";

export const TIER_ORDER: ScoreTierKey[] = ["strong", "recommended", "conditional", "caution"];

export const scoreTier = (score: number): ScoreTierKey => {
  if (score >= 85) return "strong";
  if (score >= 75) return "recommended";
  if (score >= 65) return "conditional";
  return "caution";
};

export type ToolScore = {
  editorial: number;
  external: ExternalScore | null;
  composite: number;
  stars: number;
  tier: ScoreTierKey;
};

export const computeToolScore = (input: {
  scoreBreakdown: ScoreBreakdown;
  externalRatings: ExternalRating[];
}): ToolScore => {
  const editorial = computeEditorialScore(input.scoreBreakdown);
  const external = computeExternalScore(input.externalRatings);
  const composite = computeCompositeScore(editorial, external ? external.score : null);
  return { editorial, external, composite, stars: scoreToStars(composite), tier: scoreTier(composite) };
};

export type RankInfo = {
  overall: number;
  total: number;
  category?: number;
  categoryTotal?: number;
};

/** 종합 점수 기준 전체 순위와 카테고리 내 순위를 계산합니다 (동점은 같은 순위). */
export const rankItems = <T extends { id: string; category?: string }>(
  items: T[],
  scoreOf: (item: T) => number
): Map<string, RankInfo> => {
  const sorted = [...items].sort((a, b) => scoreOf(b) - scoreOf(a));
  const ranks = new Map<string, RankInfo>();
  let lastScore: number | null = null;
  let lastRank = 0;
  sorted.forEach((item, index) => {
    const score = scoreOf(item);
    const rank = score === lastScore ? lastRank : index + 1;
    lastScore = score;
    lastRank = rank;
    ranks.set(item.id, { overall: rank, total: items.length });
  });

  const byCategory = new Map<string, T[]>();
  for (const item of items) {
    if (!item.category) continue;
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }
  for (const list of Array.from(byCategory.values())) {
    const sortedCategory = [...list].sort((a, b) => scoreOf(b) - scoreOf(a));
    let prevScore: number | null = null;
    let prevRank = 0;
    sortedCategory.forEach((item, index) => {
      const score = scoreOf(item);
      const rank = score === prevScore ? prevRank : index + 1;
      prevScore = score;
      prevRank = rank;
      const info = ranks.get(item.id);
      if (info) {
        info.category = rank;
        info.categoryTotal = list.length;
      }
    });
  }
  return ranks;
};
