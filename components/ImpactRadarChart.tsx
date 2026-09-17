"use client";

import { impactDimensions, type SignalBenchmark } from "@/lib/insights";
import type { ImpactScores } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

type RadarPoint = {
  x: number;
  y: number;
};

const center = 130;
const radius = 82;
const maxScore = 10;

const getPoint = (value: number, index: number, total: number): RadarPoint => {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / total;
  const distance = (value / maxScore) * radius;

  return {
    x: center + Math.cos(angle) * distance,
    y: center + Math.sin(angle) * distance
  };
};

const toPolygonPoints = (values: number[]) =>
  values.map((value, index) => {
    const point = getPoint(value, index, values.length);
    return `${point.x},${point.y}`;
  }).join(" ");

export function ImpactRadarChart({
  impact,
  benchmark
}: {
  impact: ImpactScores;
  benchmark?: SignalBenchmark;
}) {
  const { lang, t } = useLanguage();
  const labels = {
    judgmentSpeed: t.impactLabels[0],
    thinkingDepth: t.impactLabels[1],
    executionDensity: t.impactLabels[2],
    collaborationClarity: t.impactLabels[3]
  };
  const currentValues = impactDimensions.map((dimension) => impact[dimension]);
  const averageValues = impactDimensions.map((dimension) => benchmark?.averages[dimension] ?? 0);
  const labelPoints = impactDimensions.map((_, index) => getPoint(11.45, index, impactDimensions.length));
  const chartLabel =
    lang === "ko"
      ? `현재 도구 임팩트 레이더. 평균 ${benchmark?.corpusAverage ?? "-"}점과 비교합니다.`
      : `Current tool impact radar compared with an average of ${benchmark?.corpusAverage ?? "-"}.`;

  return (
    <figure className="impact-radar-chart" aria-label={chartLabel}>
      <svg role="img" viewBox="0 0 260 260">
        <title>{lang === "ko" ? "사람 중심 임팩트 레이더" : "Human impact radar"}</title>
        {[2, 4, 6, 8, 10].map((ring) => (
          <polygon
            className="radar-ring"
            key={ring}
            points={toPolygonPoints(impactDimensions.map(() => ring))}
          />
        ))}
        {impactDimensions.map((_, index) => {
          const end = getPoint(maxScore, index, impactDimensions.length);
          return <line className="radar-axis" key={index} x1={center} x2={end.x} y1={center} y2={end.y} />;
        })}
        {benchmark ? (
          <polygon className="radar-average-area" points={toPolygonPoints(averageValues)} />
        ) : null}
        <polygon className="radar-current-area" points={toPolygonPoints(currentValues)} />
        {impactDimensions.map((dimension, index) => {
          const point = getPoint(impact[dimension], index, impactDimensions.length);
          return <circle className="radar-current-dot" cx={point.x} cy={point.y} key={dimension} r="4" />;
        })}
        {impactDimensions.map((dimension, index) => {
          const point = labelPoints[index];
          return (
            <text
              className="radar-label"
              dominantBaseline="middle"
              key={dimension}
              textAnchor={index === 1 ? "start" : index === 3 ? "end" : "middle"}
              x={point.x}
              y={point.y}
            >
              {labels[dimension]}
            </text>
          );
        })}
      </svg>
      <figcaption className="radar-legend">
        <span>
          <i className="legend-current" aria-hidden="true" />
          {lang === "ko" ? "현재 서비스" : "Current"}
        </span>
        {benchmark ? (
          <span>
            <i className="legend-average" aria-hidden="true" />
            {lang === "ko" ? `${benchmark.peerCount}개 서비스 평균` : `${benchmark.peerCount} tool average`}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
