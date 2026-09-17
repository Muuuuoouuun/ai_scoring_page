import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { tools } from "@/data/tools";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import type { Tool } from "@/lib/types";

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

  const customTools = readJsonFile<Tool[]>("custom-tools.json", []);
  return NextResponse.json([...tools, ...customTools]);
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 401 });

  const body = await req.json();
  const required = ["name", "description", "problemContexts", "whyExist", "impact", "bestCase", "worstCase", "verdictBadges", "alternatives"];
  for (const key of required) {
    if (!body[key]) return NextResponse.json({ error: `${key} 필드가 필요합니다.` }, { status: 400 });
  }

  const customTools = readJsonFile<Tool[]>("custom-tools.json", []);
  const newTool: Tool = {
    id: crypto.randomUUID(),
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  customTools.push(newTool);
  writeJsonFile("custom-tools.json", customTools);
  return NextResponse.json(newTool, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 401 });

  const { id } = await req.json();
  const customTools = readJsonFile<Tool[]>("custom-tools.json", []);
  const filtered = customTools.filter((t) => t.id !== id);
  writeJsonFile("custom-tools.json", filtered);
  return NextResponse.json({ ok: true });
}
