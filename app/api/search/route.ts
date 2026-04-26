import { searchTools } from "@/lib/tools";
import type { ToolGenre, VerdictBadges } from "@/lib/types";

const parseBadges = (badgesParam: string | null): Partial<VerdictBadges> | undefined => {
  if (!badgesParam) return undefined;
  const badges: Partial<VerdictBadges> = {};
  badgesParam.split(",").forEach((badge) => {
    if (badge === "timeSaver") badges.timeSaver = true;
    if (badge === "thinkCarefully") badges.thinkCarefully = true;
    if (badge === "lockinRisk") badges.lockinRisk = true;
  });
  return badges;
};

const parseGenres = (genresParam: string | null): ToolGenre[] | undefined => {
  if (!genresParam) return undefined;
  const genres = genresParam
    .split(",")
    .filter((genre): genre is ToolGenre =>
      genre === "ai" || genre === "it" || genre === "githubProject" || genre === "saas"
    );
  return genres.length > 0 ? genres : undefined;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? undefined;
  const problem = searchParams.get("problem") ?? undefined;
  const badges = parseBadges(searchParams.get("badges"));
  const genres = parseGenres(searchParams.get("genres"));

  const tools = searchTools({ query, problem, badges, genres });
  return Response.json({ tools }, { status: 200 });
}
