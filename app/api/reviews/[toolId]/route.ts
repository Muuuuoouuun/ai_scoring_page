import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import type { Review } from "@/lib/types";

export async function GET(_req: NextRequest, { params }: { params: { toolId: string } }) {
  const reviews = readJsonFile<Review[]>("reviews.json", []);
  const toolReviews = reviews
    .filter((r) => r.toolId === params.toolId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(toolReviews);
}

export async function POST(req: NextRequest, { params }: { params: { toolId: string } }) {
  const body = await req.json();
  const { line, detail, rating, nickname } = body;

  if (!line?.trim()) {
    return NextResponse.json({ error: "한줄 리뷰를 입력해주세요." }, { status: 400 });
  }

  const sessionId = cookies().get("g2-session")?.value;
  const user = sessionId ? getSessionUser(sessionId) : null;

  const reviews = readJsonFile<Review[]>("reviews.json", []);
  const review: Review = {
    id: crypto.randomUUID(),
    toolId: params.toolId,
    userId: user?.id ?? "anonymous",
    nickname: nickname?.trim() || user?.nickname || "익명",
    line: line.trim(),
    detail: detail?.trim() ?? "",
    rating: Math.max(1, Math.min(5, Number(rating) || 4)),
    createdAt: new Date().toISOString()
  };

  reviews.push(review);
  writeJsonFile("reviews.json", reviews);

  // Update user stats if logged in
  if (user) {
    const { updateUserStats } = await import("@/lib/auth");
    updateUserStats(user.id, { reviewCount: 1, points: 10 });
  }

  return NextResponse.json(review, { status: 201 });
}
