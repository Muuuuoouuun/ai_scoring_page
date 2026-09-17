"use client";

import type { ImpactScores } from "@/lib/types";
import { impactDimensions, type SignalBenchmark } from "@/lib/insights";
import { useLanguage } from "@/components/LanguageProvider";
import { ImpactRadarChart } from "@/components/ImpactRadarChart";

export function ImpactMeterGrid({
  impact,
  benchmark
}: {
  impact: ImpactScores;
  benchmark?: SignalBenchmark;
}) {
  const { lang, t } = useLanguage();
  const labels: Record<keyof ImpactScores, string> = {
    judgmentSpeed: t.impactLabels[0],
    thinkingDepth: t.impactLabels[1],
    executionDensity: t.impactLabels[2],
    collaborationClarity: t.impactLabels[3]
  };
  const strongest = benchmark ? labels[benchmark.strongestDimension] : "";
  const softest = benchmark ? labels[benchmark.softestDimension] : "";

  return (
    <section className="card impact-radar-card">
      <div className="impact-radar-head">
        <span className="section-kicker">SIGNAL RADAR</span>
        <strong>{t.impactTitle}</strong>
      </div>
      <ImpactRadarChart impact={impact} benchmark={benchmark} />
      {benchmark ? (
        <div className="benchmark-summary">
          <div>
            <span>{lang === "ko" ? "전체 순위" : "Overall rank"}</span>
            <strong>
              {benchmark.overallRank}/{benchmark.peerCount}
            </strong>
          </div>
          <div>
            <span>{lang === "ko" ? "현재 평균" : "Current avg"}</span>
            <strong>{benchmark.toolAverage}/10</strong>
          </div>
          <div>
            <span>{lang === "ko" ? "서비스 평균" : "Peer avg"}</span>
            <strong>{benchmark.corpusAverage}/10</strong>
          </div>
        </div>
      ) : null}
      <div className="impact-grid">
        {impactDimensions.map((dimension) => (
          <div className="impact-item" key={dimension}>
            <div className="impact-item-line">
              <label htmlFor={`impact-${dimension}`}>{labels[dimension]}</label>
              <span>{impact[dimension]}/10</span>
            </div>
            <meter id={`impact-${dimension}`} min={0} max={10} value={impact[dimension]} />
            {benchmark ? (
              <small>
                {lang === "ko" ? "평균 대비" : "vs average"}{" "}
                {benchmark.deltas[dimension] >= 0 ? "+" : ""}
                {benchmark.deltas[dimension]}
                {" · "}
                {lang === "ko" ? "리더" : "leader"} {benchmark.leaders[dimension].name}{" "}
                {benchmark.leaders[dimension].value}/10
              </small>
            ) : null}
          </div>
        ))}
      </div>
      {benchmark ? (
        <p className="benchmark-note">
          {lang === "ko"
            ? `${strongest} 축에서 상대적으로 강하고, ${softest} 축은 도입 원칙을 더 명확히 잡아야 합니다.`
            : `Relatively strongest on ${strongest}; ${softest} needs clearer adoption rules.`}
        </p>
      ) : null}
    </section>
  );
}
