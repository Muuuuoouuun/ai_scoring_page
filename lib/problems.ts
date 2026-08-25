import { problemTags, problemTagMap } from "@/data/problem-tags";
import { problemAngles } from "@/data/problem-angles";
import { tools } from "@/data/tools";
import type { Language } from "@/lib/i18n";
import type { ProblemTag, Tool, ToolProblemAngle } from "@/lib/types";

export { problemTags, problemTagMap };

export const getTagLabel = (tag: ProblemTag, lang: Language) =>
  lang === "ko" ? tag.ko : tag.en;

export const getTag = (tagId: string): ProblemTag | undefined => problemTagMap.get(tagId);

/** 이 도구가 이 문제에서 되는 것 / 안 되는 것. 없으면 undefined. */
export const getAngle = (toolId: string, tagId: string): ToolProblemAngle | undefined =>
  problemAngles[toolId]?.find((entry) => entry.tagId === tagId);

export const getAnglesForTool = (toolId: string): ToolProblemAngle[] => problemAngles[toolId] ?? [];

/** 한 문제에 걸리는 도구들. 이 함수가 3개 미만을 돌려주면 비교 화면이 성립하지 않습니다. */
export const getToolsForTag = (tagId: string): Tool[] =>
  tools.filter((tool) => tool.problemTagIds.includes(tagId));

export const countToolsForTag = (tagId: string): number => getToolsForTag(tagId).length;

/** 태그를 걸린 도구 수가 많은 순으로. 홈과 검색이 같은 목록을 쓰게 하는 단일 출처입니다. */
export const getRankedTags = (): ProblemTag[] =>
  [...problemTags].sort((a, b) => countToolsForTag(b.id) - countToolsForTag(a.id));
