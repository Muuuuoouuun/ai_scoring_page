"use client";

import Link from "next/link";
import type { CapabilityComparison } from "@/lib/insights";
import { tools } from "@/data/tools";
import { compareHref } from "@/lib/compare";
import { useLanguage } from "@/components/LanguageProvider";

const findCatalogTool = (name: string) => {
  const needle = name.trim().toLowerCase();
  return tools.find((tool) => tool.name.toLowerCase() === needle);
};

export function CapabilityComparisonTable({
  toolId,
  toolName,
  rows
}: {
  toolId?: string;
  toolName: string;
  rows: CapabilityComparison[];
}) {
  const { t } = useLanguage();

  return (
    <section className="card feature-card comparison-card">
      <span className="section-kicker">HEAD-TO-HEAD</span>
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
        {rows.map((row) => {
          const catalogTool = toolId ? findCatalogTool(row.competitor) : undefined;
          return (
            <div key={row.competitor} className="comparison-row" role="row">
              <strong>
                {row.competitor}
                {catalogTool && toolId ? (
                  <Link className="comparison-compare-link" href={compareHref([toolId, catalogTool.id])}>
                    {t.compareGo} →
                  </Link>
                ) : null}
              </strong>
              <span className="highlight-better-text comparison-cell" data-label={`${toolName} ${t.comparisonBetter}`}>
                {row.worksBetterHere}
              </span>
              <span className="text-muted comparison-cell" data-label={`${toolName} ${t.comparisonWorse}`}>
                {row.weakerHere}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
