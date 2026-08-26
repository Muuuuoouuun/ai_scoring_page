"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductLogo } from "@/components/ProductLogo";
import { copy as t } from "@/lib/copy";
import { getToolById } from "@/lib/tools";
import { getTotalScore, SCORE_FACET_KEYS } from "@/lib/insights";
import { getTag, getAngle, getTagLabel } from "@/lib/problems";
import type { FitLevel, Tool } from "@/lib/types";

const fitClass: Record<FitLevel, string> = {
  fits: "fit-yes",
  conditional: "fit-maybe",
  avoid: "fit-no"
};

export default function CompareClient() {
  const searchParams = useSearchParams();

  const ids = (searchParams.get("tools") ?? "").split(",").filter(Boolean).slice(0, 3);
  const tools = ids.map((id) => getToolById(id)).filter((tool): tool is Tool => Boolean(tool));
  const tagId = searchParams.get("tag") ?? "";
  const tag = tagId ? getTag(tagId) : undefined;

  if (tools.length < 2) {
    return (
      <main className="compare-page">
        {/* 빈 상태에도 페이지 제목은 있어야 합니다. 이전에는 h1이 없어
            브라우저 개요와 스크린리더에 이름 없는 화면으로 잡혔습니다. */}
        <header className="compare-header">
          <span className="section-kicker">SIDE BY SIDE</span>
          <h1>{t.compareTitle}</h1>
        </header>
        <div className="card empty-state">
          <strong>{t.compareNeedTwo}</strong>
          <p>{t.compareEmptyDesc}</p>
          <Link className="button" href="/search">
            {t.compareGoSearch}
          </Link>
        </div>
      </main>
    );
  }

  const fitLabel: Record<FitLevel, string> = {
    fits: t.fitFits,
    conditional: t.fitConditional,
    avoid: t.fitAvoid
  };

  const scoreLabels = t.scoreLabels;

  return (
    <main className="compare-page">
      <header className="compare-header">
        <span className="section-kicker">SIDE BY SIDE</span>
        <h1>{t.compareTitle}</h1>
        {tag ? (
          <p className="text-muted">
            {t.compareForProblem} <strong>{getTagLabel(tag)}</strong>
          </p>
        ) : (
          <p className="text-muted">{t.compareDesc}</p>
        )}
      </header>

      <div className="compare-scroll">
        <div className="compare-grid" style={{ "--cols": tools.length } as React.CSSProperties}>
          {/* 헤더 행 */}
          <div className="compare-row-label compare-sticky-corner" />
          {tools.map((tool) => (
            <div className="compare-col-head" key={tool.id}>
              <ProductLogo name={tool.name} size="md" />
              <Link href={`/tools/${tool.id}`}>{tool.name}</Link>
              <span className="compare-total">
                {getTotalScore(tool.review.scoreBreakdown)}
                <small>/100</small>
              </span>
            </div>
          ))}

          {/* 이 문제에서 되는 것 / 안 되는 것 */}
          {tag ? (
            <>
              <div className="compare-row-label">{t.compareAngleRow}</div>
              {tools.map((tool) => {
                const angle = getAngle(tool.id, tag.id);
                return (
                  <div className="compare-cell" key={`${tool.id}-angle`}>
                    {angle ? (
                      <>
                        <p className="angle-yes">{angle.angle}</p>
                        <p className="angle-no">{angle.limitation}</p>
                      </>
                    ) : (
                      <p className="text-muted">{t.compareNotMapped}</p>
                    )}
                  </div>
                );
              })}
            </>
          ) : null}

          {/* 한줄 총평 */}
          <div className="compare-row-label">{t.reviewSummary}</div>
          {tools.map((tool) => (
            <div className="compare-cell" key={`${tool.id}-verdict`}>
              <p>{tool.review.verdict}</p>
            </div>
          ))}

          {/* 항목 점수 */}
          {SCORE_FACET_KEYS.map((key, index) => {
            const best = Math.max(...tools.map((tool) => tool.review.scoreBreakdown[key].score));
            return (
              <div className="compare-subgroup" key={key} style={{ display: "contents" }}>
                <div className="compare-row-label compare-row-score">{scoreLabels[index]}</div>
                {tools.map((tool) => {
                  const facet = tool.review.scoreBreakdown[key];
                  return (
                    <div className="compare-cell compare-cell-score" key={`${tool.id}-${key}`}>
                      <div className="compare-score-head">
                        <strong className={facet.score === best ? "is-best" : ""}>{facet.score}</strong>
                        <span className="compare-score-bar" aria-hidden="true">
                          <span style={{ width: `${facet.score}%` }} />
                        </span>
                      </div>
                      <p className="compare-score-reason">{facet.reason}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* 팀 규모별 적합도 */}
          <div className="compare-row-label">{t.teamFitRow}</div>
          {tools.map((tool) => (
            <div className="compare-cell" key={`${tool.id}-fit`}>
              <ul className="fit-list">
                {tool.review.teamFit.map((fit) => (
                  <li key={fit.band} className={fitClass[fit.fit]}>
                    <span className="fit-band">{fit.band}</span>
                    <span className="fit-level">{fitLabel[fit.fit]}</span>
                    <p>{fit.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 쓰지 말아야 할 조건 */}
          <div className="compare-row-label compare-row-warn">{t.doNotUseRow}</div>
          {tools.map((tool) => (
            <div className="compare-cell" key={`${tool.id}-dont`}>
              <ul className="dont-list">
                {tool.review.doNotUseIf.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* 가격 구조 */}
          <div className="compare-row-label">{t.pricingRow}</div>
          {tools.map((tool) => {
            const pricing = tool.review.pricingModel;
            return (
              <div className="compare-cell" key={`${tool.id}-price`}>
                <p className="pricing-entry">{pricing.entryCost}</p>
                {pricing.spikeTriggers.length > 0 ? (
                  <>
                    <span className="cell-sublabel">{t.pricingSpike}</span>
                    <ul className="spike-list">
                      {pricing.spikeTriggers.map((trigger) => (
                        <li key={trigger}>{trigger}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                <span className="as-of">
                  {pricing.asOf ? `${t.asOf} ${pricing.asOf}` : t.asOfUnknown}
                </span>
              </div>
            );
          })}

          {/* 도입 비용 */}
          <div className="compare-row-label">{t.adoptionRow}</div>
          {tools.map((tool) => {
            const adoption = tool.review.adoption;
            return (
              <div className="compare-cell" key={`${tool.id}-adopt`}>
                <p>
                  <span className="cell-sublabel">{t.timeToValue}</span> {adoption.timeToValue}
                </p>
                <p>
                  <span className="cell-sublabel">{t.timeToSettle}</span> {adoption.timeToSettle}
                </p>
                <p className="text-muted">{adoption.requiredOwner}</p>
              </div>
            );
          })}

          {/* 이탈 비용 */}
          <div className="compare-row-label">{t.exitRow}</div>
          {tools.map((tool) => {
            const exit = tool.review.exitCost;
            return (
              <div className="compare-cell" key={`${tool.id}-exit`}>
                <span className={`exit-pill exit-${exit.difficulty}`}>{t.exitLevels[exit.difficulty]}</span>
                <p>{exit.exportReality}</p>
                <p className="text-muted">{exit.switchWindow}</p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="compare-foot text-muted">{t.compareFoot}</p>
    </main>
  );
}
