import { tools } from "@/data/tools";
import { SCORE_FACET_KEYS } from "@/lib/insights";
import type { Tool } from "@/lib/types";

export type OpenQuestion = {
  id: string;
  toolId: string;
  toolName: string;
  kind: "low-score" | "no-history" | "worst-case";
  question: string;
  /** 우리가 확인하지 못한 것. 0은 실패가 아니라 초대장으로 읽혀야 합니다. */
  weDontKnow: string;
  href: string;
};

const FACET_LABEL_KO: Record<string, string> = {
  functionality: "기능 완성도",
  uiux: "UI/UX",
  reliability: "에러/안정성",
  comfort: "쾌적도",
  pricing: "가격 합리성"
};

/**
 * 커뮤니티 홈을 "활동 피드"가 아니라 "열린 질문 보드"로 만듭니다.
 *
 * 활동 피드는 0건이면 죽어 보이지만, 답이 없는 질문 목록은 0건이어도 정상입니다.
 * 질문은 이미 가진 진짜 자산(에디터가 근거와 함께 매긴 점수, 빈 변경 이력, 최악 시나리오)에서
 * 만들어냅니다. 가짜 데이터가 아니라 출처가 분명한 편집 콘텐츠입니다.
 */
export const buildOpenQuestions = (): OpenQuestion[] => {
  const questions: OpenQuestion[] = [];
  const facetLabel = FACET_LABEL_KO;

  const lowestFacet = (tool: Tool) =>
    SCORE_FACET_KEYS.reduce((lowest, key) =>
      tool.review.scoreBreakdown[key].score < tool.review.scoreBreakdown[lowest].score ? key : lowest
    );

  tools.forEach((tool) => {
    const facet = lowestFacet(tool);
    const value = tool.review.scoreBreakdown[facet];

    questions.push({
      id: `${tool.id}-low-${facet}`,
      toolId: tool.id,
      toolName: tool.name,
      kind: "low-score",
      question: `${tool.name} ${facetLabel[facet]} ${value.score}점. 실제로 그렇게 느끼셨나요?`,
      weDontKnow: value.reason,
      href: `/tools/${tool.id}`
    });

    if (tool.review.patchNotes.length === 0) {
      questions.push({
        id: `${tool.id}-no-history`,
        toolId: tool.id,
        toolName: tool.name,
        kind: "no-history",
        question: `${tool.name}에서 확인된 변경 이력이 아직 없습니다. 최근에 업무가 막힌 적 있나요?`,
        weDontKnow: "패치나 정책 변경으로 실무가 막힌 사례를 우리는 아직 확인하지 못했습니다.",
        href: `/tools/${tool.id}`
      });
    }

    questions.push({
      id: `${tool.id}-worst`,
      toolId: tool.id,
      toolName: tool.name,
      kind: "worst-case",
      question: `${tool.name}이 이렇게 될 수 있다고 봤습니다. 실제로 그렇게 됐나요?`,
      weDontKnow: tool.worstCase,
      href: `/tools/${tool.id}`
    });
  });

  return questions;
};
