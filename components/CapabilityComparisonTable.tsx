"use client";

import type { CapabilityComparison } from "@/lib/insights";
import { useLanguage } from "@/components/LanguageProvider";

export function CapabilityComparisonTable({
  toolName,
  rows
}: {
  toolName: string;
  rows: CapabilityComparison[];
}) {
  const { t } = useLanguage();

  return (
    <section className="card">
      <strong>{t.comparisonTitle}</strong>
      <div className="comparison-table" role="table" aria-label="도구 기능 비교표">
        <div className="comparison-head" role="row">
          <span>{t.comparisonTarget}</span>
          <span>
            {toolName} {t.comparisonBetter}
          </span>
          <span>
            {toolName} {t.comparisonWorse}
          </span>
        </div>
        {rows.map((row) => (
          <div key={row.competitor} className="comparison-row" role="row">
            <strong>{row.competitor}</strong>
            <span>{row.worksBetterHere}</span>
            <span>{row.weakerHere}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
