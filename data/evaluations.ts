import type { ToolEvaluation } from "@/lib/types";

/**
 * 도구 id → 조사 기반 평가 데이터.
 * 공식 체인지로그, 가격 페이지, G2/Capterra/Product Hunt 등 외부 사이트를 참고해 채웁니다.
 */
export const evaluations: Record<string, ToolEvaluation> = {};
