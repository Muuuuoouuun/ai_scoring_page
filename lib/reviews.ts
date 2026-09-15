export type ReviewItem = {
  id: string;
  nickname: string;
  line: string;
  detail: string;
  rating: number;
  imageUrl?: string;
  createdAt: string;
};

export type RatingSummary = {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export const REVIEWS_EVENT = "g2-reviews-changed";
export const REVIEW_LIMIT = 30;

export const reviewStorageKey = (toolId: string) => `g2-reviews-${toolId}`;

const clampRating = (value: unknown): number => {
  const rating = Math.round(Number(value));
  if (!Number.isFinite(rating)) return 0;
  return Math.max(1, Math.min(5, rating));
};

export const parseReviewList = (raw: string | null): ReviewItem[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ReviewItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.id === "string" && typeof item.line === "string" && item.line.trim())
      .map((item) => ({ ...item, rating: clampRating(item.rating) }));
  } catch {
    return [];
  }
};

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const readReviews = (toolId: string): ReviewItem[] => {
  if (!canUseStorage()) return [];
  try {
    return parseReviewList(window.localStorage.getItem(reviewStorageKey(toolId)));
  } catch {
    return [];
  }
};

export const writeReviews = (toolId: string, reviews: ReviewItem[]) => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(reviewStorageKey(toolId), JSON.stringify(reviews.slice(0, REVIEW_LIMIT)));
    window.dispatchEvent(new CustomEvent(REVIEWS_EVENT, { detail: { toolId } }));
  } catch {
    // 저장소를 쓸 수 없는 환경(프라이빗 모드 등)에서는 조용히 무시합니다.
  }
};

export const addReview = (toolId: string, item: ReviewItem): ReviewItem[] => {
  const next = [{ ...item, rating: clampRating(item.rating) }, ...readReviews(toolId)].slice(0, REVIEW_LIMIT);
  writeReviews(toolId, next);
  return next;
};

export const summarizeRatings = (reviews: ReviewItem[]): RatingSummary => {
  const distribution: RatingSummary["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  for (const review of reviews) {
    const rating = clampRating(review.rating);
    if (rating === 0) continue;
    distribution[rating as 1 | 2 | 3 | 4 | 5] += 1;
    total += rating;
  }
  const count = Object.values(distribution).reduce((sum, value) => sum + value, 0);
  return {
    count,
    average: count === 0 ? 0 : Math.round((total / count) * 10) / 10,
    distribution
  };
};
