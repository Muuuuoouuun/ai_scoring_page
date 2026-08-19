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
  const { lang, t } = useLanguage();

  return (
    <section className="card comparison-card">
      <div className="comparison-card-head">
        <span className="section-kicker">CAPABILITY DELTA</span>
        <strong>{t.comparisonTitle}</strong>
      </div>
      <div className="comparison-table" role="table" aria-label={lang === "ko" ? "도구 기능 비교표" : "Capability comparison"}>
        <div className="comparison-head" role="row">
          <span role="columnheader">{t.comparisonTarget}</span>
          <span role="columnheader" className="comparison-col-better">
            {toolName} {t.comparisonBetter}
          </span>
          <span role="columnheader" className="comparison-col-worse">
            {toolName} {t.comparisonWorse}
          </span>
        </div>
        {rows.map((row) => (
          <div key={row.competitor} className="comparison-row" role="row">
            <strong role="cell" className="comparison-competitor">
              {row.competitor}
            </strong>
            <span
              role="cell"
              className="comparison-cell comparison-cell-better"
              data-label={`${toolName} ${t.comparisonBetter}`}
            >
              {row.worksBetterHere}
            </span>
            <span
              role="cell"
              className="comparison-cell comparison-cell-worse"
              data-label={`${toolName} ${t.comparisonWorse}`}
            >
              {row.weakerHere}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
