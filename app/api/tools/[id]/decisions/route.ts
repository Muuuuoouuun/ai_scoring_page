import { communityStore } from "@/lib/community/store";
import { decisionSchema } from "@/lib/community/validators";
import { resolveAuthor, authorCookieHeader } from "@/lib/community/author";
import { getToolById } from "@/lib/tools";
import type { ContributorContext } from "@/lib/community/types";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!getToolById(params.id)) {
    return Response.json({ message: "Tool not found." }, { status: 404 });
  }
  const records = await communityStore.listDecisions(params.id);

  // "이 도구를 고른 N팀 중 M팀이 X를 함께 검토했습니다" 를 만들기 위한 집계.
  const alternativeCounts = new Map<string, number>();
  records.forEach((record) =>
    record.consideredAlternatives.forEach((name) =>
      alternativeCounts.set(name, (alternativeCounts.get(name) ?? 0) + 1)
    )
  );

  return Response.json(
    {
      records,
      consideredAlternatives: Array.from(alternativeCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    },
    { status: 200 }
  );
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!getToolById(params.id)) {
    return Response.json({ message: "Tool not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Invalid payload.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const author = resolveAuthor();
  const record = await communityStore.addDecision({
    toolId: params.id,
    consideredAlternatives: parsed.data.consideredAlternatives,
    whyChosen: parsed.data.whyChosen,
    adoptedAt: parsed.data.adoptedAt,
    outcome: parsed.data.outcome,
    authorHandle: author.handle,
    isEditor: false,
    context: parsed.data.context as ContributorContext
  });

  const headers = new Headers({ "Content-Type": "application/json" });
  if (author.isNew) headers.append("Set-Cookie", authorCookieHeader(author.token));

  return new Response(JSON.stringify({ record }), { status: 201, headers });
}
