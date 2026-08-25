import { communityStore } from "@/lib/community";
import { decisionTouchSchema } from "@/lib/community/validators";
import { resolveAuthor } from "@/lib/community/author";

/**
 * "3개월 전에 이 도구를 쓴다고 기록하셨습니다. 지금도 쓰시나요?"
 * 리뷰가 썩는 걸 막는 루프입니다. 본인 토큰일 때만 갱신됩니다.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null);
  const parsed = decisionTouchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Invalid payload." }, { status: 400 });
  }

  const author = resolveAuthor();
  if (author.isNew) {
    return Response.json({ message: "본인이 작성한 기록만 갱신할 수 있습니다." }, { status: 403 });
  }

  const record = await communityStore.touchDecision(params.id, { tokenHash: author.tokenHash, handle: author.handle }, parsed.data.outcome);
  if (!record) {
    return Response.json({ message: "본인이 작성한 기록만 갱신할 수 있습니다." }, { status: 403 });
  }
  return Response.json({ record }, { status: 200 });
}
