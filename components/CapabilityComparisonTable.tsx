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
    <section className="card feature-card">
      <strong>🎯 {t.comparisonTitle}</strong>
      <div className="comparison-table" role="table" aria-label="도구 기능 비교표">
        <div className="comparison-head" role="row">
          <span>{t.comparisonTarget}</span>
          <span className="highlight-better">
            {toolName} {t.comparisonBetter}
          </span>
          <span>
            {toolName} {t.comparisonWorse}
          </span>
        </div>
        {rows.map((row) => (
          <div key={row.competitor} className="comparison-row" role="row">
            <strong>{row.competitor}</strong>
            <span className="highlight-better-text comparison-cell" data-label={`${toolName} ${t.comparisonBetter}`}>
              {row.worksBetterHere}
            </span>
            <span className="text-muted comparison-cell" data-label={`${toolName} ${t.comparisonWorse}`}>
              {row.weakerHere}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
