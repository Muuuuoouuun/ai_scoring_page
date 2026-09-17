"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addReview,
  readReviews,
  REVIEWS_EVENT,
  reviewStorageKey,
  summarizeRatings,
  type ReviewItem
} from "@/lib/reviews";

/** 도구별 커뮤니티 리뷰(로컬 저장)를 읽고, 같은 페이지의 다른 컴포넌트와 동기화합니다. */
export function useToolReviews(toolId: string) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    const sync = () => setReviews(readReviews(toolId));
    sync();
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ toolId?: string }>).detail;
      if (!detail?.toolId || detail.toolId === toolId) sync();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === reviewStorageKey(toolId)) sync();
    };
    window.addEventListener(REVIEWS_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(REVIEWS_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [toolId]);

  const add = useCallback((item: ReviewItem) => setReviews(addReview(toolId, item)), [toolId]);
  const summary = useMemo(() => summarizeRatings(reviews), [reviews]);

  return { reviews, summary, add };
}
