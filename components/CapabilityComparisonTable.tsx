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

  return (
    <section className="card comparison-card">
      <div className="comparison-head-block">
        <span className="section-kicker">CAPABILITY DELTA</span>
        <h2>{t.comparisonTitle}</h2>
        <p className="text-muted">{t.comparisonDesc}</p>
      </div>

      <div className="comparison-list">
        {rows.map((row) => (
          <article className="comparison-block" key={row.competitor}>
            <header className="comparison-block-head">
              <span className="comparison-vs">{t.comparisonTarget}</span>
              <strong>{row.competitor}</strong>
            </header>
            <div className="comparison-split">
              <div className="comparison-cell comparison-cell-better">
                <span className="comparison-cell-label">
                  {toolName} {t.comparisonBetter}
                </span>
                <p>{row.worksBetterHere}</p>
              </div>
              <div className="comparison-cell comparison-cell-worse">
                <span className="comparison-cell-label">
                  {toolName} {t.comparisonWorse}
                </span>
                <p>{row.weakerHere}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
