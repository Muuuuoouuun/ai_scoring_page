import { describe, expect, it } from "vitest";
import { tools } from "@/data/tools";
import { problemTags } from "@/data/problem-tags";
import { problemAngles } from "@/data/problem-angles";
import { getToolsForTag, getAngle } from "@/lib/problems";

/**
 * 이 제품의 핵심 동선은 "문제 → 후보 여럿 → 나란히 비교"입니다.
 * 한 문제에 도구가 하나만 걸리면 비교 단계가 구조적으로 성립하지 않습니다.
 * 이전 데이터가 정확히 그 상태였습니다(문제 30개 전부 유니크, 공유 0개).
 */
describe("문제 태그", () => {
  it("모든 태그가 3개 이상의 도구에 걸린다", () => {
    problemTags.forEach((tag) => {
      const matched = getToolsForTag(tag.id);
      expect(matched.length, `${tag.id}에 걸린 도구가 ${matched.length}개뿐입니다`).toBeGreaterThanOrEqual(3);
    });
  });

  it("도구가 참조하는 태그가 전부 존재한다", () => {
    const known = new Set(problemTags.map((tag) => tag.id));
    tools.forEach((tool) => {
      tool.problemTagIds.forEach((tagId) => {
        expect(known.has(tagId), `${tool.name}이 없는 태그 ${tagId}를 참조합니다`).toBe(true);
      });
    });
  });

  it("모든 도구-태그 쌍에 되는 것/안 되는 것이 있다", () => {
    tools.forEach((tool) => {
      tool.problemTagIds.forEach((tagId) => {
        const angle = getAngle(tool.id, tagId);
        expect(angle, `${tool.name} × ${tagId}에 문장이 없습니다`).toBeTruthy();
        expect(angle!.angle.length).toBeGreaterThan(10);
        expect(angle!.limitation.length).toBeGreaterThan(10);
      });
    });
  });

  it("문제별 문장이 도구 간에 재사용되지 않는다", () => {
    const sentences = Object.values(problemAngles)
      .flat()
      .flatMap((entry) => [entry.angle, entry.limitation]);
    expect(new Set(sentences).size).toBe(sentences.length);
  });

  it("태그 id가 언어와 무관하다", () => {
    // 영어 화면에서 문제를 눌러도 같은 결과가 나와야 합니다.
    // 이전에는 표시 문장을 그대로 쿼리로 넘겨서 영어 모드 결과가 항상 0건이었습니다.
    problemTags.forEach((tag) => {
      expect(tag.id).toMatch(/^[a-z0-9-]+$/);
      expect(tag.ko.length).toBeGreaterThan(0);
      expect(tag.en.length).toBeGreaterThan(0);
    });
  });
});
