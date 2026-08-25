"use client";

import { Suspense } from "react";
import CompareClient from "@/app/compare/CompareClient";

export default function ComparePage() {
  return (
    <Suspense fallback={<main className="compare-page"><p className="section">…</p></main>}>
      <CompareClient />
    </Suspense>
  );
}
