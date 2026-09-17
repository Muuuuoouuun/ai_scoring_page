"use client";

import type { CapabilityComparison } from "@/lib/insights";
import { copy as t } from "@/lib/copy";

/**
 * 대안 도구 대비 "되는 것 / 안 되는 것".
 *
 * 이전 버전은 380px 사이드바 안에 3열 그리드(1fr 2fr 2fr)로 들어가 글자가 겹쳤습니다.
 * 1열 전환 분기가 뷰포트 폭 기준이라 좁은 컨테이너에서는 끝내 걸리지 않았습니다.
 * 이제 competitor마다 블록을 만들고, 내부는 auto-fit으로 컨테이너 폭에 맞춰 접힙니다.
 */
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
