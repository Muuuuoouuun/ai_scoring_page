import { communityStore } from "@/lib/community/store";
import { breakageSchema } from "@/lib/community/validators";
import { resolveAuthor, authorCookieHeader } from "@/lib/community/author";
import { getToolById } from "@/lib/tools";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!getToolById(params.id)) {
    return Response.json({ message: "Tool not found." }, { status: 404 });
  }
  // 검수를 통과한 것만 공개합니다.
  const reports = await communityStore.listBreakage(params.id, "published");
  return Response.json({ reports }, { status: 200 });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!getToolById(params.id)) {
    return Response.json({ message: "Tool not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = breakageSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Invalid payload.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const author = resolveAuthor();
  const report = await communityStore.addBreakage({
    toolId: params.id,
    occurredAt: parsed.data.occurredAt,
    whatBroke: parsed.data.whatBroke,
    workaround: parsed.data.workaround,
    authorHandle: author.handle
  });

  const headers = new Headers({ "Content-Type": "application/json" });
  if (author.isNew) headers.append("Set-Cookie", authorCookieHeader(author.token));

  // 바로 공개되지 않는다는 사실을 응답에 명시합니다.
  return new Response(JSON.stringify({ report, pendingReview: true }), { status: 201, headers });
}
