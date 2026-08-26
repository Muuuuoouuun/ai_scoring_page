"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const MAX_COMPARE = 3;

type CompareContextValue = {
  selected: string[];
  isSelected: (toolId: string) => boolean;
  toggle: (toolId: string) => void;
  remove: (toolId: string) => void;
  clear: () => void;
  isFull: boolean;
};

const CompareContext = createContext<CompareContextValue | null>(null);

const STORAGE_KEY = "ais-compare";

/**
 * 비교 담기 상태.
 *
 * 이 제품의 핵심 동선은 "문제 → 후보 3~5개 → 그중 2~3개를 나란히 놓고 고르기"입니다.
 * 마지막 단계가 지금까지 통째로 없었습니다.
 * 선택은 페이지를 이동해도 유지되어야 하므로 sessionStorage에 둡니다.
 */
export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSelected(parsed.filter((id): id is string => typeof id === "string").slice(0, MAX_COMPARE));
      }
    } catch {
      /* 저장소 접근이 막힌 환경(프라이빗 모드 등)에서도 화면은 정상 동작해야 합니다. */
    }
  }, []);

  const persist = useCallback((next: string[]) => {
    setSelected(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* 저장 실패는 무시합니다. 이번 세션 안에서는 메모리 상태로 계속 동작합니다. */
    }
  }, []);

  const value = useMemo<CompareContextValue>(
    () => ({
      selected,
      isSelected: (toolId: string) => selected.includes(toolId),
      isFull: selected.length >= MAX_COMPARE,
      toggle: (toolId: string) => {
        if (selected.includes(toolId)) {
          persist(selected.filter((id) => id !== toolId));
        } else if (selected.length < MAX_COMPARE) {
          persist([...selected, toolId]);
        }
      },
      remove: (toolId: string) => persist(selected.filter((id) => id !== toolId)),
      clear: () => persist([])
    }),
    [persist, selected]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used inside CompareProvider");
  }
  return context;
}
