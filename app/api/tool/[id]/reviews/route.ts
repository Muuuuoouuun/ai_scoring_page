import { getActorFromHeaders } from "@/lib/admin";
import { createUserReview, listUserReviews } from "@/lib/server-store";
import { getToolById } from "@/lib/tools";
import { userReviewSchema } from "@/lib/validators";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const tool = getToolById(params.id);
  if (!tool) {
    return Response.json({ message: "Tool not found." }, { status: 404 });
  }

  return Response.json({ reviews: await listUserReviews(params.id) }, { status: 200 });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const tool = getToolById(params.id);
  if (!tool) {
    return Response.json({ message: "Tool not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const result = userReviewSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ message: "Invalid payload.", errors: result.error.flatten() }, { status: 400 });
  }

  const review = await createUserReview({
    toolId: params.id,
    actor: getActorFromHeaders(request.headers),
    input: result.data
  });

  return Response.json({ review }, { status: 201 });
}
