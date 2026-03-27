import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/storage";
import type { Discussion } from "@/lib/types";

export async function GET() {
  const discussions = readJsonFile<Discussion[]>("discussions.json", []);
  const sorted = [...discussions]
    .sort((a, b) => {
      const scoreA = a.replies.length * 3 + 1;
      const scoreB = b.replies.length * 3 + 1;
      return scoreB - scoreA;
    })
    .slice(0, 20);
  return NextResponse.json(sorted);
}
