"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { JournalIcon } from "@/components/JournalIcon";
import { ProductLogo } from "@/components/ProductLogo";
import { useLanguage } from "@/components/LanguageProvider";
import type { Tool } from "@/lib/types";
import {
  compareCapabilityOptions,
  comparisonDimensions,
  getWeightedToolScore,
  type ComparisonDimension
} from "@/lib/editorial";

const initialWeights: Record<ComparisonDimension, number> = {
  judgmentSpeed: 7,
  thinkingDepth: 6,
  executionDensity: 8,
  collaborationClarity: 6
};

type CapabilityId = (typeof compareCapabilityOptions)[number]["id"];

export function ComparisonWorkbench({ tools }: { tools: Tool[] }) {
  const { lang, t } = useLanguage();
  const [weights, setWeights] = useState<Record<ComparisonDimension, number>>(initialWeights);
  const [selectedCapabilities, setSelectedCapabilities] = useState<CapabilityId[]>(["timeSaver"]);
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>(tools.slice(0, 2).map((tool) => tool.id));

  const rankedTools = useMemo(() => {
    return tools
      .filter((tool) =>
        selectedCapabilities.every((capability) =>
          capability === "githubProject"
            ? tool.genres.includes("githubProject")
            : tool.verdictBadges[capability]
        )
      )
      .map((tool) => ({
        tool,
        score: getWeightedToolScore(tool, weights)
      }))
      .sort((a, b) => b.score - a.score);
  }, [selectedCapabilities, tools, weights]);

  const selectedTools = selectedToolIds
    .map((id) => tools.find((tool) => tool.id === id))
    .filter((tool): tool is Tool => Boolean(tool));

  const toggleCapability = (capability: CapabilityId) => {
    setSelectedCapabilities((current) =>
      current.includes(capability)
        ? current.filter((item) => item !== capability)
        : [...current, capability]
    );
  };

  const toggleTool = (toolId: string) => {
    setSelectedToolIds((current) => {
      if (current.includes(toolId)) {
        return current.filter((id) => id !== toolId);
      }

      return [...current.slice(-3), toolId];
    });
  };

  return (
    <div className="compare-workbench">
      <aside className="compare-filter-panel card" aria-label={lang === "ko" ? "비교 조건" : "Comparison filters"}>
        <div className="compare-panel-head">
          <span className="section-kicker">
            <JournalIcon name="compare" />
            COMPARISON LENS
          </span>
          <h2>{lang === "ko" ? "의사결정 기준을 조정하세요" : "Tune the decision lens"}</h2>
          <p className="text-muted">
            {lang === "ko"
              ? "중요한 지표를 높이면 결과 순위와 비교 트레이가 함께 바뀝니다."
              : "Raise the markers that matter and the ranking plus tray will react immediately."}
          </p>
        </div>

        <div className="marker-slider-stack">
          {comparisonDimensions.map((dimension) => (
            <label className="marker-slider" key={dimension.id}>
              <span>
                <strong>{dimension.label[lang]}</strong>
                <small>{weights[dimension.id]}</small>
              </span>
              <input
                type="range"
                min="1"
                max="10"
                value={weights[dimension.id]}
                onChange={(event) =>
                  setWeights((current) => ({
                    ...current,
                    [dimension.id]: Number(event.target.value)
                  }))
                }
              />
            </label>
          ))}
        </div>

        <fieldset className="search-fieldset">
          <legend className="search-fieldset-legend">
            {lang === "ko" ? "필수 조건" : "Required capabilities"}
          </legend>
          <div className="compare-check-list">
            {compareCapabilityOptions.map((capability) => (
              <label key={capability.id}>
                <input
                  type="checkbox"
                  checked={selectedCapabilities.includes(capability.id)}
                  onChange={() => toggleCapability(capability.id)}
                />
                <span>{capability.label[lang]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </aside>

      <section className="compare-results-panel">
        <div className="section compare-hero-strip">
          <span className="section-kicker">RECOMMENDED SEARCH</span>
          <h1>{lang === "ko" ? "비슷해 보이는 도구를 빠르게 배제하기" : "Quickly rule out look-alike tools"}</h1>
          <p>
            {lang === "ko"
              ? "검색 결과에서 끝내지 않고, 실제 선택 기준을 기준으로 후보를 2-4개까지 좁힙니다."
              : "Move past search results by narrowing candidates to the 2-4 tools worth discussing."}
          </p>
        </div>

        <div className="compare-card-grid">
          {rankedTools.map(({ tool, score }) => {
            const isSelected = selectedToolIds.includes(tool.id);

            return (
              <article className={`compare-tool-card card ${isSelected ? "active" : ""}`} key={tool.id}>
                <div className="compare-tool-head">
                  <ProductLogo name={tool.name} size="md" />
                  <div>
                    <h2>{tool.name}</h2>
                    <span>{score}/10 match</span>
                  </div>
                  <button
                    aria-pressed={isSelected}
                    aria-label={isSelected ? `${tool.name} 제거` : `${tool.name} 비교 추가`}
                    className="icon-action-button"
                    onClick={() => toggleTool(tool.id)}
                    type="button"
                  >
                    <JournalIcon name={isSelected ? "shield" : "compare"} />
                  </button>
                </div>
                <p>{tool.description}</p>
                <div className="compare-metric-row">
                  {comparisonDimensions.map((dimension) => (
                    <span key={dimension.id}>
                      <small>{dimension.short[lang]}</small>
                      <strong>{tool.impact[dimension.id]}</strong>
                    </span>
                  ))}
                </div>
                <div className="tool-card-footer">
                  <Link className="tool-link" href={`/tools/${tool.id}`}>
                    {t.readReview}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="compare-tray" aria-label={lang === "ko" ? "비교 트레이" : "Comparison tray"}>
        <div>
          <span className="section-kicker">COMPARATIVE ANALYSIS TRAY</span>
          <h3>{lang === "ko" ? "선택된 후보" : "Selected candidates"}</h3>
        </div>
        <div className="compare-tray-tools">
          {selectedTools.length === 0 ? (
            <p className="text-muted">{lang === "ko" ? "비교할 도구를 추가하세요." : "Add tools to compare."}</p>
          ) : (
            selectedTools.map((tool) => (
              <button key={tool.id} onClick={() => toggleTool(tool.id)} type="button">
                <ProductLogo name={tool.name} size="sm" />
                <span>{tool.name}</span>
              </button>
            ))
          )}
        </div>
        {selectedTools.length > 0 ? (
          <div className="compare-table-mini">
            {comparisonDimensions.map((dimension) => (
              <div key={dimension.id}>
                <strong>{dimension.short[lang]}</strong>
                {selectedTools.map((tool) => (
                  <span key={`${tool.id}-${dimension.id}`}>{tool.impact[dimension.id]}</span>
                ))}
              </div>
            ))}
          </div>
        ) : null}
        <button className="button" type="button" onClick={() => setSelectedToolIds([])}>
          {lang === "ko" ? "트레이 비우기" : "Clear tray"}
        </button>
      </aside>
    </div>
  );
}
