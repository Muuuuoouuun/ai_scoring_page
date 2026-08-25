import { communityStore } from "@/lib/community";
import { dissentSchema } from "@/lib/community/validators";
import { resolveAuthor, authorCookieHeader } from "@/lib/community/author";
import { buildFacetConsensus, buildDistribution, buildRoleSplit } from "@/lib/community/consensus";
import { getToolById } from "@/lib/tools";
import type { ContributorContext, ScoreFacetKey } from "@/lib/community/types";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!getToolById(params.id)) {
    return Response.json({ message: "Tool not found." }, { status: 404 });
  }
  const entries = await communityStore.listDissent(params.id);

  const facets: ScoreFacetKey[] = ["functionality", "uiux", "reliability", "comfort", "pricing"];
  const byFacet = Object.fromEntries(
    facets.map((facet) => [facet, buildFacetConsensus(entries.filter((e) => e.facet === facet))])
  );

  return Response.json(
    { byFacet, distribution: buildDistribution(entries), roleSplit: buildRoleSplit(entries) },
    { status: 200 }
  );
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!getToolById(params.id)) {
    return Response.json({ message: "Tool not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = dissentSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Invalid payload.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const author = resolveAuthor();
  const entry = await communityStore.addDissent({
    toolId: params.id,
    facet: parsed.data.facet as ScoreFacetKey,
    direction: parsed.data.direction,
    reason: parsed.data.reason,
    author: { tokenHash: author.tokenHash, handle: author.handle },
    isEditor: false,
    context: parsed.data.context as ContributorContext
  });

  const headers = new Headers({ "Content-Type": "application/json" });
  if (author.isNew) headers.append("Set-Cookie", authorCookieHeader(author.token));

  return new Response(JSON.stringify({ entry }), { status: 201, headers });
}
