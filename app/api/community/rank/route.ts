import { NextResponse } from "next/server";
import { getAllPublicUsers } from "@/lib/auth";

export async function GET() {
  const users = getAllPublicUsers()
    .filter((u) => u.reviewCount > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 20);
  return NextResponse.json(users);
}
