"use client";

import { useCallback, useEffect, useState } from "react";
import { copy as t } from "@/lib/copy";
import { ContextPicker, isContextComplete } from "@/components/community/ContextPicker";
import { SCORE_FACET_KEYS } from "@/lib/insights";
import type { ScoreBreakdown } from "@/lib/types";
import type { ContributorContext, DissentDirection, FacetDissent } from "@/lib/community/types";
import type { FacetConsensus } from "@/lib/community/consensus";

type ConsensusMap = Record<string, FacetConsensus>;

/**
 * 점수 근거와 그에 대한 이의.
 *
 * 커뮤니티의 첫 기여를 "빈 게시판에 글쓰기"가 아니라 "이미 나온 판단에 이의 달기"로 만듭니다.
 * 화면에 "안정성 62점"이 근거와 함께 떠 있으면 반박할 대상이 이미 있으므로 쓸 말이 생깁니다.
 *
 * 표본이 3 미만이면 평균이나 비율을 만들지 않고 원본 응답을 그대로 보여줍니다.
 * "4.5점(2명)"은 거짓말에 가깝기 때문입니다.
 */
export function ScoreDissent({
  toolId,
  scoreBreakdown
}: {
  toolId: string;
  scoreBreakdown: ScoreBreakdown;
}) {
  const [consensus, setConsensus] = useState<ConsensusMap>({});
  const [openFacet, setOpenFacet] = useState<string | null>(null);
  const [direction, setDirection] = useState<DissentDirection>("too-low");
  const [reason, setReason] = useState("");
  const [context, setContext] = useState<Partial<ContributorContext>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/tools/${toolId}/dissent`);
      if (!response.ok) return;
      const data = await response.json();
      setConsensus(data.byFacet ?? {});
    } catch {
      /* 커뮤니티 데이터를 못 받아도 리뷰 본문은 그대로 읽혀야 합니다. */
    }
  }, [toolId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (facet: string) => {
    if (direction !== "agree" && reason.trim().length < 20) {
      setError(t.dissentNeedReason);
      return;
    }
    if (!isContextComplete(context)) {
      setError(t.ctxRequired);
      return;
    }
    setStatus("saving");
    setError("");
    try {
      const response = await fetch(`/api/tools/${toolId}/dissent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facet, direction, reason, context })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message ?? t.saveFailed);
        setStatus("error");
        return;
      }
      setStatus("done");
      setReason("");
      setOpenFacet(null);
      await load();
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setError(t.saveFailed);
      setStatus("error");
    }
  };

  const renderResponses = (entries: FacetDissent[]) => (
    <ul className="dissent-responses">
      {entries.map((entry) => (
        <li key={entry.id} className={`dissent-${entry.direction}`}>
          <span className="dissent-context">
            {t.roleLabels[entry.context.role]} · {t.teamSizeLabels[entry.context.teamSize]} ·{" "}
            {t.durationLabels[entry.context.duration]}
          </span>
          <span className="dissent-direction-tag">{t.dissentDirections[entry.direction]}</span>
          {entry.reason ? <p>{entry.reason}</p> : null}
          <span className="dissent-handle">{entry.authorHandle}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <details className="card score-dissent-card collapsible">
      <summary>
        {t.dissentTitle}
        <span className="summary-count">{t.dissentSummaryHint}</span>
      </summary>
      <p className="text-muted section-lede">{t.dissentDesc}</p>

      <div className="dissent-list">
        {SCORE_FACET_KEYS.map((facet, index) => {
          const value = scoreBreakdown[facet];
          const result = consensus[facet];
          const isOpen = openFacet === facet;

          return (
            <article className="dissent-item" key={facet}>
              <div className="dissent-item-head">
                <div>
                  <strong>{t.scoreLabels[index]}</strong>
                  <span className="dissent-score">{value.score}</span>
                </div>
                <div className="dissent-actions">
                  {(["agree", "too-low", "too-high"] as DissentDirection[]).map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={isOpen && direction === option ? "active" : ""}
                      onClick={() => {
                        setOpenFacet(facet);
                        setDirection(option);
                        setError("");
                      }}
                    >
                      {t.dissentDirections[option]}
                    </button>
                  ))}
                </div>
              </div>

              <p className="dissent-editor-reason">{value.reason}</p>

              {isOpen ? (
                <div className="dissent-form">
                  {direction !== "agree" ? (
                    <label className="dissent-reason-field">
                      <span>{t.dissentReasonLabel}</span>
                      <textarea
                        rows={3}
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder={t.dissentReasonPlaceholder}
                        maxLength={400}
                      />
                      <small className={reason.trim().length >= 20 ? "ok" : ""}>
                        {reason.trim().length}/20
                      </small>
                    </label>
                  ) : null}

                  <ContextPicker value={context} onChange={setContext} />

                  {error ? <p className="form-error">{error}</p> : null}

                  <div className="dissent-form-actions">
                    <button
                      className="button"
                      type="button"
                      onClick={() => submit(facet)}
                      disabled={status === "saving"}
                    >
                      {status === "saving" ? t.saving : t.dissentSubmit}
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => {
                        setOpenFacet(null);
                        setError("");
                      }}
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* 표본이 3 미만이면 요약하지 않고 원본을 그대로 보여줍니다. */}
              {result?.kind === "raw" ? (
                <div className="dissent-raw">
                  <span className="dissent-sample-note">
                    {`지금까지 ${result.entries.length}명이 답했습니다. 표본이 적어 요약하지 않습니다.`}
                  </span>
                  {renderResponses(result.entries)}
                </div>
              ) : null}

              {result?.kind === "aggregate" ? (
                <div className="dissent-aggregate">
                  <div className="dissent-bar" aria-hidden="true">
                    <span className="seg-agree" style={{ flex: result.agree }} />
                    <span className="seg-low" style={{ flex: result.tooLow }} />
                    <span className="seg-high" style={{ flex: result.tooHigh }} />
                  </div>
                  <span className="dissent-sample-note">
                    {t.dissentDirections.agree} {result.agree} · {t.dissentDirections["too-low"]}{" "}
                    {result.tooLow} · {t.dissentDirections["too-high"]} {result.tooHigh} (n=
                    {result.total})
                  </span>
                  {renderResponses(result.entries)}
                </div>
              ) : null}

              {result?.kind === "empty" || !result ? (
                <p className="dissent-open-question">{t.dissentEmpty}</p>
              ) : null}
            </article>
          );
        })}
      </div>

      {status === "done" ? <p className="form-success">{t.dissentThanks}</p> : null}
    </details>
  );
}
