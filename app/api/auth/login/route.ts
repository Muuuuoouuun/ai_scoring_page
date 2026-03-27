import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { login, initDefaultUsers } from "@/lib/auth";

export async function POST(req: NextRequest) {
  initDefaultUsers();
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
  }
  const sessionId = login(email, password);
  if (!sessionId) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  cookies().set("g2-session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60
  });
  return NextResponse.json({ ok: true });
}
