import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser, initDefaultUsers } from "@/lib/auth";

export async function GET() {
  initDefaultUsers();
  const sessionId = cookies().get("g2-session")?.value;
  if (!sessionId) return NextResponse.json(null);
  const user = getSessionUser(sessionId);
  return NextResponse.json(user);
}
