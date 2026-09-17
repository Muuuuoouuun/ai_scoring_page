import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/storage";
import type { Review } from "@/lib/types";

export async function GET() {
  const reviews = readJsonFile<Review[]>("reviews.json", []);
  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json(sorted.slice(0, 50));
}
