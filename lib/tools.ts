import { tools } from "@/data/tools";
import type { Tool, ToolGenre, VerdictBadges } from "@/lib/types";

export const getAllTools = (): Tool[] => tools;

export const getToolById = (id: string): Tool | undefined =>
  tools.find((tool) => tool.id === id);

const normalize = (value: string) => value.toLowerCase();

const toolText = (tool: Tool) =>
  [tool.name, tool.description, tool.whyExist, ...tool.genres, ...tool.problemContexts, tool.bestCase, tool.worstCase]
    .join(" ")
    .toLowerCase();

const badgesMatch = (tool: Tool, badges: Partial<VerdictBadges>) => {
  const entries = Object.entries(badges).filter(([, value]) => value === true);
  return entries.every(([key]) => tool.verdictBadges[key as keyof VerdictBadges]);
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

  return tools
    .map((tool) => {
      let score = 0;
      if (cleanedQuery && toolText(tool).includes(cleanedQuery)) {
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
      return { tool, score };
    })
    .filter(({ score }) => score > 0 || (!query && !problem && !badges && (!genres || genres.length === 0)))
    .sort((a, b) => b.score - a.score)
    .map(({ tool }) => tool);
};
