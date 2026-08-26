"use client";

import type { Tool } from "@/lib/types";
import { copy as t } from "@/lib/copy";

const fitClass = { fits: "fit-yes", conditional: "fit-maybe", avoid: "fit-no" } as const;

/**
 * 도입 판단에 필요한 사실들.
 *
 * "이 도구가 어떤 도구인가"는 위쪽 리뷰가 답합니다.
 * 여기는 결정권자가 회의에서 실제로 받는 질문 — 우리 규모에 맞나, 무엇을 지불하나,
 * 나갈 때 얼마나 드나 — 에 답합니다.
 */
export function AdoptionFacts({ tool }: { tool: Tool }) {
  const { doNotUseIf, teamFit, adoption, pricingModel, exitCost } = tool.review;

  return (
    <div className="adoption-facts">
      {/* 가장 먼저 하는 행동은 고르기가 아니라 떨어뜨리기입니다. 그래서 이게 맨 위입니다. */}
      <section className="card do-not-use-card">
        <div className="do-not-use-head">
          <span className="section-kicker">DISQUALIFIERS</span>
          <h2>{t.doNotUseRow}</h2>
        </div>
        <ul className="dont-list">
          {doNotUseIf.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="card team-fit-card">
        <span className="section-kicker">TEAM FIT</span>
        <h2>{t.teamFitRow}</h2>
        <ul className="fit-list">
          {teamFit.map((fit) => (
            <li key={fit.band} className={fitClass[fit.fit]}>
              <div className="fit-row-head">
                <span className="fit-band">{t.teamSizeLabels[fit.band]}</span>
                <span className="fit-level">{t[`fit${fit.fit === "fits" ? "Fits" : fit.fit === "conditional" ? "Conditional" : "Avoid"}`]}</span>
              </div>
              <p>{fit.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/*
        떨어뜨리기(doNotUseIf)와 우리 규모(teamFit)는 항상 펼칩니다.
        비용 세 가지는 그 둘을 통과한 뒤에 보는 정보라 접어둡니다.
      */}
      <details className="card cost-group collapsible">
        <summary>
          {t.costGroupTitle}
          <span className="summary-count">{t.costGroupHint}</span>
        </summary>
        <div className="adoption-grid">
        <section className="card adoption-cost-card">
          <span className="section-kicker">ADOPTION COST</span>
          <h2>{t.adoptionRow}</h2>
          <dl className="fact-list">
            <div>
              <dt>{t.timeToValue}</dt>
              <dd>{adoption.timeToValue}</dd>
            </div>
            <div>
              <dt>{t.timeToSettle}</dt>
              <dd>{adoption.timeToSettle}</dd>
            </div>
            <div>
              <dt>{t.requiredOwner}</dt>
              <dd>{adoption.requiredOwner}</dd>
            </div>
            <div>
              <dt>{t.firstMonthRisk}</dt>
              <dd className="text-muted">{adoption.firstMonthRisk}</dd>
            </div>
          </dl>
        </section>

        <section className="card pricing-card">
          <span className="section-kicker">PRICING</span>
          <h2>{t.pricingRow}</h2>
          <p className="pricing-entry">{pricingModel.entryCost}</p>
          {pricingModel.spikeTriggers.length > 0 ? (
            <>
              <span className="cell-sublabel">{t.pricingSpike}</span>
              <ul className="spike-list">
                {pricingModel.spikeTriggers.map((trigger) => (
                  <li key={trigger}>{trigger}</li>
                ))}
              </ul>
            </>
          ) : null}
          <p className="text-muted free-tier">{pricingModel.freeTierReality}</p>
          {/* 가격은 이 사이트에서 가장 빨리 틀려지는 데이터라 화면이 스스로 경고합니다. */}
          <p className="as-of-warning">
            {pricingModel.asOf ? `${t.asOf} ${pricingModel.asOf}` : t.asOfUnknown} · {t.pricingStale}
          </p>
        </section>

        <section className="card exit-card">
          <span className="section-kicker">EXIT COST</span>
          <h2>{t.exitRow}</h2>
          <span className={`exit-pill exit-${exitCost.difficulty}`}>
            {t.exitLevels[exitCost.difficulty]}
          </span>
          <dl className="fact-list">
            <div>
              <dt>{t.exportReality}</dt>
              <dd>{exitCost.exportReality}</dd>
            </div>
            <div>
              <dt>{t.whatYouLose}</dt>
              <dd>{exitCost.whatYouLose}</dd>
            </div>
            <div>
              <dt>{t.switchWindow}</dt>
              <dd className="text-muted">{exitCost.switchWindow}</dd>
            </div>
          </dl>
        </section>
        </div>
      </details>
    </div>
  );
}
