import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, login, initDefaultUsers } from "@/lib/auth";

export async function POST(req: NextRequest) {
  initDefaultUsers();
  const { email, nickname, password } = await req.json();
  if (!email || !nickname || !password) {
    return NextResponse.json({ error: "모든 필드를 입력해주세요." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "비밀번호는 최소 6자 이상이어야 합니다." }, { status: 400 });
  }
  try {
    createUser(email, nickname, password, "user");
    const sessionId = login(email, password);
    if (sessionId) {
      cookies().set("g2-session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "회원가입에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
