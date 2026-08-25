import { describe, expect, it } from "vitest";
import { tools } from "@/data/tools";
import { getToolInsight, SCORE_FACET_KEYS } from "@/lib/insights";

/**
 * 진단에서 확인된 문제가 다시 들어오는 것을 막는 테스트입니다.
 *
 * 이전 상태:
 *  - 10개 도구 중 8개의 한줄 총평이 이름만 바꾼 같은 문장
 *  - 패치노트 / 실무 가이드가 10개 전부 동일
 *  - 가격·안정성 점수가 각각 두 가지 값만 존재 (배지 boolean에서 파생)
 *  - 총점이 전부 60~72에 몰려 선택에 도움이 안 됨
 *
 * 아래 테스트는 그 상태로 되돌아가면 반드시 실패합니다.
 */

const insights = tools.map((tool) => ({ tool, insight: getToolInsight(tool) }));
const unique = (values: string[]) => new Set(values).size;

describe("리뷰 본문은 도구마다 달라야 한다", () => {
  it("한줄 총평이 도구마다 고유하다", () => {
    const verdicts = insights.map(({ insight }) => insight.oneLine);
    expect(unique(verdicts)).toBe(tools.length);
  });

  it("실무 가이드 제목이 도구 간에 공유되지 않는다", () => {
    const titles = insights.flatMap(({ insight }) => insight.workPlaybook.map((item) => item.title));
    expect(unique(titles)).toBe(titles.length);
  });

  it("비교 문장이 도구 간에 공유되지 않는다", () => {
    const sentences = insights.flatMap(({ insight }) =>
      insight.comparisons.flatMap((row) => [row.worksBetterHere, row.weakerHere])
    );
    expect(unique(sentences)).toBe(sentences.length);
  });

  it("패치노트 제목이 도구 간에 공유되지 않는다", () => {
    const titles = insights.flatMap(({ insight }) => insight.patchNotes.map((note) => note.title));
    expect(unique(titles)).toBe(titles.length);
  });
});

describe("점수에는 근거가 붙어야 한다", () => {
  it("모든 항목에 의미 있는 길이의 근거가 있다", () => {
    insights.forEach(({ tool, insight }) => {
      SCORE_FACET_KEYS.forEach((key) => {
        const facet = insight.scoreBreakdown[key];
        expect(facet.reason.trim().length, `${tool.name}.${key}의 근거가 비어 있음`).toBeGreaterThan(10);
      });
    });
  });

  it("근거 문장이 도구 간에 재사용되지 않는다", () => {
    const reasons = insights.flatMap(({ insight }) =>
      SCORE_FACET_KEYS.map((key) => insight.scoreBreakdown[key].reason)
    );
    expect(unique(reasons)).toBe(reasons.length);
  });
});

describe("점수 척도가 실제로 쓰여야 한다", () => {
  it("총점이 60~72 구간에 갇혀 있지 않다", () => {
    const totals = insights.map(({ insight }) => insight.totalScore);
    const spread = Math.max(...totals) - Math.min(...totals);
    // 진단 시점의 폭은 12점이었습니다. 그 수준으로 돌아가면 실패합니다.
    expect(spread).toBeGreaterThan(20);
  });

  it("가격과 안정성 점수가 두 가지 값으로 고정되어 있지 않다", () => {
    const pricing = insights.map(({ insight }) => insight.scoreBreakdown.pricing.score);
    const reliability = insights.map(({ insight }) => insight.scoreBreakdown.reliability.score);
    // 파생 공식일 때는 각각 정확히 2개 값(55/72, 64/80)뿐이었습니다.
    expect(new Set(pricing).size).toBeGreaterThan(4);
    expect(new Set(reliability).size).toBeGreaterThan(4);
  });

  it("항목 점수가 0~100 범위를 넓게 사용한다", () => {
    const all = insights.flatMap(({ insight }) =>
      SCORE_FACET_KEYS.map((key) => insight.scoreBreakdown[key].score)
    );
    expect(Math.min(...all)).toBeLessThan(50);
    expect(Math.max(...all)).toBeGreaterThan(85);
  });
});

describe("모든 도구가 리뷰를 갖는다", () => {
  it("비교와 실무 가이드가 비어 있지 않다", () => {
    tools.forEach((tool) => {
      expect(tool.review.comparisons.length, `${tool.name}에 비교가 없음`).toBeGreaterThan(0);
      expect(tool.review.playbook.length, `${tool.name}에 실무 가이드가 없음`).toBeGreaterThan(0);
    });
  });
});
