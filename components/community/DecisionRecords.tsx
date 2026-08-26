"use client";

import { useCallback, useEffect, useState } from "react";
import { copy as t } from "@/lib/copy";
import { ContextPicker, isContextComplete } from "@/components/community/ContextPicker";
import type { ContributorContext, DecisionOutcome, DecisionRecord } from "@/lib/community/types";

const STALE_DAYS = 180;

const isStale = (checkedAt: string) =>
  (Date.now() - new Date(checkedAt).getTime()) / 86_400_000 > STALE_DAYS;

/**
 * 도입 결정 기록.
 *
 * "별점 4.5"는 아무것도 알려주지 않지만, "10~49인 팀이 Airtable 대신 이걸 골랐고
 * 8개월 뒤 축소했다"는 판단을 즉시 바꿉니다.
 * 비교 데이터·이탈 데이터·시간축 데이터를 한 번에 만듭니다.
 */
export function DecisionRecords({ toolId, toolName }: { toolId: string; toolName: string }) {
  const [records, setRecords] = useState<DecisionRecord[]>([]);
  const [alternatives, setAlternatives] = useState<{ name: string; count: number }[]>([]);
  const [open, setOpen] = useState(false);

  const [considered, setConsidered] = useState("");
  const [whyChosen, setWhyChosen] = useState("");
  const [adoptedAt, setAdoptedAt] = useState("");
  const [outcome, setOutcome] = useState<DecisionOutcome>("still-using");
  const [context, setContext] = useState<Partial<ContributorContext>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/tools/${toolId}/decisions`);
      if (!response.ok) return;
      const data = await response.json();
      setRecords(data.records ?? []);
      setAlternatives(data.consideredAlternatives ?? []);
    } catch {
      /* 실패해도 리뷰 본문은 그대로 읽혀야 합니다. */
    }
  }, [toolId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (whyChosen.trim().length < 15) {
      setError(t.decisionNeedWhy);
      return;
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(adoptedAt)) {
      setError(t.decisionNeedDate);
      return;
    }
    if (!isContextComplete(context)) {
      setError(t.ctxRequired);
      return;
    }
    setStatus("saving");
    setError("");
    try {
      const response = await fetch(`/api/tools/${toolId}/decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consideredAlternatives: considered
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
            .slice(0, 5),
          whyChosen,
          adoptedAt,
          outcome,
          context
        })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message ?? t.saveFailed);
        setStatus("idle");
        return;
      }
      setStatus("done");
      setConsidered("");
      setWhyChosen("");
      setAdoptedAt("");
      setOpen(false);
      await load();
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setError(t.saveFailed);
      setStatus("idle");
    }
  };

  const topAlternative = alternatives[0];

  return (
    <details className="card decision-records-card collapsible">
      <summary>
        {t.decisionTitle}
        <span className="summary-count">{records.length}</span>
      </summary>
      <p className="text-muted section-lede">{t.decisionDesc}</p>

      {/* 집계는 표본이 쌓였을 때만 문장으로 만듭니다. */}
      {records.length >= 3 && topAlternative ? (
        <p className="decision-summary">
          {`${toolName}을(를) 고른 ${records.length}팀 중 ${topAlternative.count}팀이 ${topAlternative.name}을(를) 함께 검토했습니다.`}
        </p>
      ) : null}

      {records.length === 0 ? (
        <div className="decision-empty">
          <p>{t.decisionEmpty}</p>
          <p className="decision-first-perk">{t.decisionFirstPerk}</p>
        </div>
      ) : (
        <ul className="decision-list">
          {records.map((record) => (
            <li key={record.id} className={`decision-item outcome-${record.outcome}`}>
              <div className="decision-item-head">
                {/* 닉네임보다 "어떤 처지의 사람이 썼나"를 먼저 보여줍니다. */}
                <span className="decision-context">
                  {t.roleLabels[record.context.role]} · {t.teamSizeLabels[record.context.teamSize]} ·{" "}
                  {t.durationLabels[record.context.duration]}
                </span>
                <span className={`outcome-pill outcome-${record.outcome}`}>
                  {t.outcomeLabels[record.outcome]}
                </span>
              </div>
              {record.consideredAlternatives.length > 0 ? (
                <p className="decision-alts">
                  <span className="cell-sublabel">{t.decisionConsidered}</span>{" "}
                  {record.consideredAlternatives.join(", ")}
                </p>
              ) : null}
              <p className="decision-why">{record.whyChosen}</p>
              <div className="decision-meta">
                <span>
                  {record.adoptedAt} {t.decisionAdopted}
                </span>
                {isStale(record.checkedAt) ? (
                  <span className="stale-flag">{t.decisionStale}</span>
                ) : (
                  <span className="checked-flag">
                    {record.checkedAt.slice(0, 7)} {t.decisionChecked}
                  </span>
                )}
                {record.isEditor ? <span className="editor-flag">{t.editorBadge}</span> : null}
                <span className="decision-handle">{record.authorHandle}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <div className="decision-form">
          <label>
            <span>{t.decisionConsideredLabel}</span>
            <input
              value={considered}
              onChange={(event) => setConsidered(event.target.value)}
              placeholder={t.decisionConsideredPlaceholder}
            />
          </label>
          <label>
            <span>{t.decisionWhyLabel}</span>
            <textarea
              rows={3}
              value={whyChosen}
              onChange={(event) => setWhyChosen(event.target.value)}
              placeholder={t.decisionWhyPlaceholder}
              maxLength={400}
            />
          </label>
          <label>
            <span>{t.decisionWhenLabel}</span>
            <input
              value={adoptedAt}
              onChange={(event) => setAdoptedAt(event.target.value)}
              placeholder="2025-03"
              inputMode="numeric"
            />
          </label>
          <fieldset className="context-group">
            <legend>{t.decisionOutcomeLabel}</legend>
            <div className="context-options">
              {(["still-using", "reduced", "stopped"] as DecisionOutcome[]).map((option) => (
                <button
                  type="button"
                  key={option}
                  className={outcome === option ? "active" : ""}
                  aria-pressed={outcome === option}
                  onClick={() => setOutcome(option)}
                >
                  {t.outcomeLabels[option]}
                </button>
              ))}
            </div>
          </fieldset>

          <ContextPicker value={context} onChange={setContext} />

          {error ? <p className="form-error">{error}</p> : null}

          <div className="dissent-form-actions">
            <button className="button" type="button" onClick={submit} disabled={status === "saving"}>
              {status === "saving" ? t.saving : t.decisionSubmit}
            </button>
            <button className="secondary-button" type="button" onClick={() => setOpen(false)}>
              {t.cancel}
            </button>
          </div>
        </div>
      ) : (
        <button className="secondary-button" type="button" onClick={() => setOpen(true)}>
          {t.decisionAdd}
        </button>
      )}

      {status === "done" ? <p className="form-success">{t.decisionThanks}</p> : null}
    </details>
  );
}
