import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import type { Review } from "@/lib/types";

function requireAdmin() {
  const sessionId = cookies().get("g2-session")?.value;
  if (!sessionId) return null;
  const user = getSessionUser(sessionId);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET() {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 401 });

  const reviews = readJsonFile<Review[]>("reviews.json", []);
  return NextResponse.json(
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 401 });

  const { id } = await req.json();
  const reviews = readJsonFile<Review[]>("reviews.json", []);
  const filtered = reviews.filter((r) => r.id !== id);
  writeJsonFile("reviews.json", filtered);
  return NextResponse.json({ ok: true });
}
