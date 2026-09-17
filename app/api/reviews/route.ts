import { reviewSchema } from "@/lib/validators";
import { addAuditLog, addReview, getReviews } from "@/lib/store";
import { getActorId } from "@/lib/admin";
import type { UserReview, AuditLog } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const toolId = searchParams.get("toolId");
  if (!toolId) {
    return Response.json({ message: "toolId is required." }, { status: 400 });
  }
  const reviews = getReviews(toolId);
  return Response.json({ reviews }, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = reviewSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { message: "Invalid payload.", errors: result.error.flatten() },
      { status: 400 }
    );
  }

  const actorId = getActorId(request) ?? "anonymous";
  const review: UserReview = {
    id: crypto.randomUUID(),
    toolId: result.data.toolId,
    nickname: result.data.nickname ?? "Anonymous",
    line: result.data.line,
    detail: result.data.detail,
    rating: result.data.rating,
    imageUrl: result.data.imageUrl,
    createdAt: new Date().toISOString()
  };

  addReview(review);

  const log: AuditLog = {
    id: crypto.randomUUID(),
    actorId,
    action: "CREATE_REVIEW",
    resourceType: "user_review",
    resourceId: review.id,
    payload: { toolId: review.toolId, rating: review.rating },
    createdAt: new Date().toISOString()
  };
  addAuditLog(log);

  return Response.json({ review }, { status: 201 });
}
