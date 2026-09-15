"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { tools } from "@/data/tools";
import type { CapabilityKey, Tool } from "@/lib/types";
import { CAPABILITY_KEYS } from "@/lib/types";
import { getCapabilityProfile, getToolInsight } from "@/lib/insights";
import { capabilityName, compareHref, COMPARE_MAX, summarizeDifferences, writeCompareIds, type CompareEntry } from "@/lib/compare";
import { scoreToStars } from "@/lib/scoring";
import { useCompareTray } from "@/components/useCompareTray";
import { useLanguage } from "@/components/LanguageProvider";
import { ProductLogo } from "@/components/ProductLogo";
import { StarRating } from "@/components/StarRating";
import { TierChip } from "@/components/TierChip";
import { VerdictBadgeList } from "@/components/VerdictBadgeList";

const SCORE_KEYS = ["functionality", "uiux", "reliability", "comfort", "pricing"] as const;
const IMPACT_KEYS = ["judgmentSpeed", "thinkingDepth", "executionDensity", "collaborationClarity"] as const;
const LEVEL_INDEX = { full: 0, partial: 1, none: 2 } as const;
const LEVEL_ICON = { full: "●", partial: "◐", none: "○" } as const;

function bestIndexes(values: number[]): Set<number> {
  if (values.length < 2) return new Set();
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (max === min) return new Set();
  return new Set(values.map((value, index) => (value === max ? index : -1)).filter((index) => index >= 0));
}

export default function CompareClient() {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  const { ids: trayIds } = useCompareTray();
  const paramIds = useMemo(
    () => (searchParams.get("ids") ?? "").split(",").filter((id) => tools.some((tool) => tool.id === id)).slice(0, COMPARE_MAX),
    [searchParams]
  );
  const [slots, setSlots] = useState<string[]>(() => {
    const initial = [...paramIds];
    while (initial.length < COMPARE_MAX) initial.push("");
    return initial;
  });
  const [seededFromTray, setSeededFromTray] = useState(false);

  // URL에 ids가 없으면 비교함 내용을 초기값으로 씁니다.
  useEffect(() => {
    if (seededFromTray || paramIds.length > 0 || trayIds.length === 0) return;
    const next = [...trayIds];
    while (next.length < COMPARE_MAX) next.push("");
    setSlots(next);
    setSeededFromTray(true);
  }, [paramIds, seededFromTray, trayIds]);

  // 선택이 바뀌면 URL과 비교함을 함께 갱신합니다.
  useEffect(() => {
    const chosen = slots.filter(Boolean);
    window.history.replaceState(null, "", chosen.length ? compareHref(chosen) : "/compare");
    writeCompareIds(chosen);
  }, [slots]);

  const entries: CompareEntry[] = useMemo(
    () =>
      slots
        .filter(Boolean)
        .map((id) => tools.find((tool) => tool.id === id))
        .filter((tool): tool is Tool => Boolean(tool))
        .map((tool) => ({ tool, insight: getToolInsight(tool), profile: getCapabilityProfile(tool) })),
    [slots]
  );
  const differences = useMemo(() => summarizeDifferences(entries, lang), [entries, lang]);

  const updateSlot = (index: number, id: string) =>
    setSlots((current) => current.map((value, i) => (i === index ? id : value === id && id ? "" : value)));

  const scoreLabels = t.scoreLabels;
  const impactLabels = t.impactLabels;

  return (
    <div className="section compare-workbench">
      <div className="compare-slots" role="group" aria-label={t.compareSlot}>
        {slots.map((value, index) => (
          <label key={index} className="compare-slot">
            <span className="search-form-label">
              {t.compareSlot} {index + 1}
            </span>
            <select value={value} onChange={(event) => updateSlot(index, event.target.value)}>
              <option value="">{t.compareSlotEmpty}</option>
              {tools.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.name}
                  {tool.category ? ` · ${tool.category}` : ""}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="card">
          <strong>{t.compareEmpty}</strong>
          <Link className="tool-link" href="/search">
            {t.navSearch} →
          </Link>
        </div>
      ) : (
        <>
          <section className="card compare-diff-card">
            <span className="section-kicker">DIFFERENCE LENS</span>
            <strong>{t.compareDiffTitle}</strong>
            {differences.length === 0 ? (
              <p className="text-muted">{t.compareDiffEmpty}</p>
            ) : (
              <ul className="compare-diff-list">
                {differences.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
          </section>

          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col" />
                  {entries.map(({ tool, insight }) => (
                    <th scope="col" key={tool.id}>
                      <div className="compare-head-cell">
                        <ProductLogo name={tool.name} size="md" />
                        <Link href={`/tools/${tool.id}`}>{tool.name}</Link>
                        <small>{tool.category}</small>
                        {tool.discontinued ? <span className="badge discontinued-badge">{t.discontinuedLabel}</span> : null}
                        <StarRating value={insight.score.stars} size="sm" />
                        <TierChip tier={insight.score.tier} size="sm" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="compare-section-row">
                  <th scope="row" colSpan={entries.length + 1}>
                    {t.compareSections[0]}
                  </th>
                </tr>
                <tr>
                  <th scope="row">{t.scoreComposite}</th>
                  {(() => {
                    const best = bestIndexes(entries.map(({ insight }) => insight.totalScore));
                    return entries.map(({ tool, insight }, index) => (
                      <td key={tool.id} className={best.has(index) ? "compare-best" : ""}>
                        <span className="compare-score">{insight.totalScore}</span>
                        <span className="compare-bar" aria-hidden="true">
                          <span style={{ width: `${insight.totalScore}%` }} />
                        </span>
                      </td>
                    ));
                  })()}
                </tr>
                {SCORE_KEYS.map((key, labelIndex) => {
                  const best = bestIndexes(entries.map(({ insight }) => insight.scoreBreakdown[key]));
                  return (
                    <tr key={key}>
                      <th scope="row">{scoreLabels[labelIndex]}</th>
                      {entries.map(({ tool, insight }, index) => (
                        <td key={tool.id} className={best.has(index) ? "compare-best" : ""}>
                          <span className="compare-score">{insight.scoreBreakdown[key]}</span>
                          <span className="compare-bar" aria-hidden="true">
                            <span style={{ width: `${insight.scoreBreakdown[key]}%` }} />
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}

                <tr className="compare-section-row">
                  <th scope="row" colSpan={entries.length + 1}>
                    {t.compareSections[1]}
                  </th>
                </tr>
                {IMPACT_KEYS.map((key, labelIndex) => {
                  const best = bestIndexes(entries.map(({ tool }) => tool.impact[key]));
                  return (
                    <tr key={key}>
                      <th scope="row">{impactLabels[labelIndex]}</th>
                      {entries.map(({ tool }, index) => (
                        <td key={tool.id} className={best.has(index) ? "compare-best" : ""}>
                          <span className="compare-score">{tool.impact[key]}/10</span>
                          <span className="compare-bar" aria-hidden="true">
                            <span style={{ width: `${tool.impact[key] * 10}%` }} />
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}

                <tr className="compare-section-row">
                  <th scope="row" colSpan={entries.length + 1}>
                    {t.compareSections[2]}
                  </th>
                </tr>
                <tr>
                  <th scope="row">{t.searchFilterLegend}</th>
                  {entries.map(({ tool }) => (
                    <td key={tool.id}>
                      <VerdictBadgeList badges={tool.verdictBadges} />
                    </td>
                  ))}
                </tr>

                <tr className="compare-section-row">
                  <th scope="row" colSpan={entries.length + 1}>
                    {t.compareSections[3]}
                  </th>
                </tr>
                {CAPABILITY_KEYS.map((key: CapabilityKey) => (
                  <tr key={key}>
                    <th scope="row">{capabilityName(key, lang)}</th>
                    {entries.map(({ tool, profile }) => {
                      const entry = profile?.capabilities[key];
                      if (!entry) {
                        return (
                          <td key={tool.id} className="compare-capability compare-capability-unknown">
                            <small>{t.capabilityUnknown}</small>
                          </td>
                        );
                      }
                      return (
                        <td key={tool.id} className={`compare-capability compare-capability-${entry.level}`} title={entry.note || undefined}>
                          <span className="compare-capability-icon" aria-hidden="true">
                            {LEVEL_ICON[entry.level]}
                          </span>
                          <span>{t.capabilityLevels[LEVEL_INDEX[entry.level]]}</span>
                          {entry.note ? <small>{entry.note}</small> : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                <tr className="compare-section-row">
                  <th scope="row" colSpan={entries.length + 1}>
                    {t.compareSections[4]}
                  </th>
                </tr>
                <tr>
                  <th scope="row">{t.pricingTitle}</th>
                  {entries.map(({ tool, insight }) => (
                    <td key={tool.id} className="compare-text">
                      {insight.pricingSummary || "—"}
                    </td>
                  ))}
                </tr>

                <tr className="compare-section-row">
                  <th scope="row" colSpan={entries.length + 1}>
                    {t.compareSections[5]}
                  </th>
                </tr>
                <tr>
                  <th scope="row">{t.keyFeaturesTitle}</th>
                  {entries.map(({ tool, insight }) => (
                    <td key={tool.id} className="compare-text">
                      {insight.keyFeatures.length === 0 ? (
                        "—"
                      ) : (
                        <ul className="compare-feature-list">
                          {insight.keyFeatures.slice(0, 4).map((feature) => (
                            <li key={feature}>{feature}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="compare-section-row">
                  <th scope="row" colSpan={entries.length + 1}>
                    {t.compareSections[6]}
                  </th>
                </tr>
                <tr>
                  <th scope="row">{t.externalRatingsTitle}</th>
                  {entries.map(({ tool, insight }) => (
                    <td key={tool.id} className="compare-text">
                      {insight.score.external ? (
                        <div className="compare-external">
                          <StarRating value={scoreToStars(insight.score.external.score)} size="sm" />
                          <ul>
                            {insight.externalRatings.map((rating) => (
                              <li key={`${rating.source}-${rating.score}`}>
                                {rating.source}: {rating.score}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="compare-section-row">
                  <th scope="row" colSpan={entries.length + 1}>
                    {t.compareSections[7]}
                  </th>
                </tr>
                <tr>
                  <th scope="row">{t.bestCase}</th>
                  {entries.map(({ tool }) => (
                    <td key={tool.id} className="compare-text compare-best-text">
                      {tool.bestCase}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">{t.worstCase}</th>
                  {entries.map(({ tool }) => (
                    <td key={tool.id} className="compare-text compare-worst-text">
                      {tool.worstCase}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
