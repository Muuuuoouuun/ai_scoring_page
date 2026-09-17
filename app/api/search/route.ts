import { searchTools } from "@/lib/tools";
import type { ToolGenre, VerdictBadges } from "@/lib/types";

const BADGE_KEYS: (keyof VerdictBadges)[] = ["timeSaver", "thinkCarefully", "lockinRisk"];
const TEAM_SIZES = ["1-5", "6-30", "30+"];

const parseBadges = (badgesParam: string | null): Partial<VerdictBadges> | undefined => {
  if (!badgesParam) return undefined;
  const requested = badgesParam.split(",").map((value) => value.trim());
  const badges: Partial<VerdictBadges> = {};
  BADGE_KEYS.forEach((key) => {
    if (requested.includes(key)) badges[key] = true;
  });
  return Object.keys(badges).length > 0 ? badges : undefined;
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
  const tagId = searchParams.get("tag") ?? undefined;
  const badges = parseBadges(searchParams.get("badges"));
  const genres = parseGenres(searchParams.get("genres"));

  const tools = searchTools({ query, problem, badges, genres });
  return Response.json({ tools }, { status: 200 });
}
