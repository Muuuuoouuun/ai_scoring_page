import { searchTools } from "@/lib/tools";
import type { VerdictBadges } from "@/lib/types";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? undefined;
  const tagId = searchParams.get("tag") ?? undefined;
  const badges = parseBadges(searchParams.get("badges"));

  const teamSizeParam = searchParams.get("teamSize");
  const teamSize = teamSizeParam && TEAM_SIZES.includes(teamSizeParam) ? teamSizeParam : undefined;

  const results = searchTools({ query, tagId, badges, teamSize });

  return Response.json(
    {
      /** 이 문제에서 되는 것 / 안 되는 것을 함께 돌려줍니다. 결과 카드가 매칭 이유를 보여줄 수 있도록. */
      results: results.map(({ tool, angle }) => ({ tool, angle })),
      count: results.length
    },
    { status: 200 }
  );
}
