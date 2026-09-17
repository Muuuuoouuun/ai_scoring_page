"use client";

import { useCallback, useEffect, useState } from "react";
import { COMPARE_EVENT, COMPARE_MAX, readCompareIds, toggleCompareId, writeCompareIds } from "@/lib/compare";

/** 비교함(로컬 저장, 최대 3개)을 읽고 페이지 전체와 동기화합니다. */
export function useCompareTray() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(readCompareIds());
    sync();
    window.addEventListener(COMPARE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COMPARE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const result = toggleCompareId(id);
    setIds(result.ids);
    return result;
  }, []);

  const remove = useCallback((id: string) => {
    const next = readCompareIds().filter((item) => item !== id);
    writeCompareIds(next);
    setIds(next);
  }, []);

  const clear = useCallback(() => {
    writeCompareIds([]);
    setIds([]);
  }, []);

  return { ids, toggle, remove, clear, isFull: ids.length >= COMPARE_MAX, max: COMPARE_MAX };
}
