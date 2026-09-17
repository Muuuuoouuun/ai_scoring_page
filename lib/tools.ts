import { tools } from "@/data/tools";
import type { Tool, ToolGenre, VerdictBadges } from "@/lib/types";

export const getAllTools = (): Tool[] => tools;

export const getToolById = (id: string): Tool | undefined =>
  tools.find((tool) => tool.id === id);

const normalize = (value: string) => value.trim().toLowerCase();

const toolText = (tool: Tool) =>
  [tool.name, tool.description, tool.whyExist, ...tool.genres, ...tool.problemContexts, tool.bestCase, tool.worstCase]
    .join(" ")
    .toLowerCase();

const badgesMatch = (tool: Tool, badges: Partial<VerdictBadges>) =>
  Object.entries(badges)
    .filter(([, value]) => value === true)
    .every(([key]) => tool.verdictBadges[key as keyof VerdictBadges]);

export type SearchQuery = {
  query?: string;
  /** 문제 태그 id. 언어와 무관합니다. */
  tagId?: string;
  badges?: Partial<VerdictBadges>;
  /** 팀 규모로 좁히기. 해당 구간이 avoid인 도구는 제외됩니다. */
  teamSize?: string;
};

export const searchTools = ({
  query,
  problem,
  badges,
  genres
}: {
  query?: string;
  problem?: string;
  badges?: Partial<VerdictBadges>;
  genres?: ToolGenre[];
}): Tool[] => {
  const cleanedQuery = query ? normalize(query) : "";
  const cleanedProblem = problem ? normalize(problem) : "";

/**
 * 검색은 이 함수 하나뿐입니다.
 *
 * 이전에는 클라이언트(SearchClient)와 서버(여기)에 로직이 두 벌 있었고 동작이 달랐습니다.
 * 서버 쪽에는 `score > 0 || !query` 조건 때문에 문제만으로 검색하면 존재하지 않는 문제를
 * 넣어도 전체 10개가 반환되는 버그가 있었습니다. 통과하던 검색 테스트가 그걸 못 잡은 이유입니다.
 * 이제 조건이 하나라도 걸리면 반드시 그 조건으로 걸러냅니다.
 */
export const searchTools = ({ query, tagId, badges, teamSize }: SearchQuery): SearchResult[] => {
  const cleanedQuery = query ? normalize(query) : "";
  const activeBadges = badges
    ? (Object.entries(badges).filter(([, v]) => v === true) as [string, boolean][])
    : [];
  return tools
    .map((tool): SearchResult | null => {
      let score = 0;

      if (tagId) {
        if (!tool.problemTagIds.includes(tagId)) return null;
        score += 3;
      }

      if (cleanedQuery) {
        if (!toolText(tool).includes(cleanedQuery)) return null;
        score += 2;
      }
      if (cleanedProblem) {
        const matchesProblem = tool.problemContexts.some((context) =>
          normalize(context).includes(cleanedProblem)
        );
        if (matchesProblem) {
          score += 3;
        }
      }
      if (badges) {
        if (badgesMatch(tool, badges)) {
          score += 1;
        } else {
          return { tool, score: -1 };
        }
      }
      if (genres && genres.length > 0) {
        const matchesGenres = genres.every((genre) => tool.genres.includes(genre));
        if (matchesGenres) {
          score += 2;
        } else {
          return { tool, score: -1 };
        }
      }

      if (teamSize) {
        const fit = tool.review.teamFit.find((entry) => entry.band === teamSize);
        if (fit?.fit === "avoid") return null;
        if (fit?.fit === "fits") score += 2;
        if (fit?.fit === "conditional") score += 1;
      }

      // 동점일 때는 총점이 높은 쪽이 먼저 오도록 소수점 보정
      score += getTotalScore(tool.review.scoreBreakdown) / 1000;

      return { tool, score, angle: tagId ? getAngle(tool.id, tagId) : undefined };
    })
    .filter(({ score }) => score > 0 || (!query && !problem && !badges && (!genres || genres.length === 0)))
    .sort((a, b) => b.score - a.score)
    .map(({ tool }) => tool);
};
