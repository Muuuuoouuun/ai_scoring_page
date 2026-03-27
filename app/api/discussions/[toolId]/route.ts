import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import type { Discussion, DiscussionReply } from "@/lib/types";

export async function GET(_req: NextRequest, { params }: { params: { toolId: string } }) {
  const discussions = readJsonFile<Discussion[]>("discussions.json", []);
  const toolDiscussions = discussions
    .filter((d) => d.toolId === params.toolId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(toolDiscussions);
}

export async function POST(req: NextRequest, { params }: { params: { toolId: string } }) {
  const body = await req.json();
  const { title, content, replyTo, replyContent, nickname } = body;

  const sessionId = cookies().get("g2-session")?.value;
  const user = sessionId ? getSessionUser(sessionId) : null;

  const discussions = readJsonFile<Discussion[]>("discussions.json", []);

  // Reply to existing discussion
  if (replyTo) {
    const idx = discussions.findIndex((d) => d.id === replyTo && d.toolId === params.toolId);
    if (idx === -1) return NextResponse.json({ error: "토론을 찾을 수 없습니다." }, { status: 404 });
    if (!replyContent?.trim()) {
      return NextResponse.json({ error: "답변 내용을 입력해주세요." }, { status: 400 });
    }
    const reply: DiscussionReply = {
      id: crypto.randomUUID(),
      discussionId: replyTo,
      userId: user?.id ?? "anonymous",
      nickname: nickname?.trim() || user?.nickname || "익명",
      content: replyContent.trim(),
      createdAt: new Date().toISOString()
    };
    discussions[idx].replies.push(reply);
    writeJsonFile("discussions.json", discussions);
    return NextResponse.json(reply, { status: 201 });
  }

  // Create new discussion
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
  }
  const discussion: Discussion = {
    id: crypto.randomUUID(),
    toolId: params.toolId,
    userId: user?.id ?? "anonymous",
    nickname: nickname?.trim() || user?.nickname || "익명",
    title: title.trim(),
    content: content.trim(),
    replies: [],
    createdAt: new Date().toISOString()
  };
  discussions.push(discussion);
  writeJsonFile("discussions.json", discussions);
  return NextResponse.json(discussion, { status: 201 });
}
