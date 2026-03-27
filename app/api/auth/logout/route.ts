import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logout } from "@/lib/auth";

export async function POST() {
  const sessionId = cookies().get("g2-session")?.value;
  if (sessionId) {
    logout(sessionId);
    cookies().delete("g2-session");
  }
  return NextResponse.json({ ok: true });
}
