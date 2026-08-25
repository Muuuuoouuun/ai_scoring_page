"use client";

import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import type { BreakageReport } from "@/lib/community/types";

/**
 * 고장 제보.
 *
 * 신뢰의 원천은 좋은 소식이 아니라 나쁜 소식입니다. 그리고 이건 커뮤니티 기여 중
 * 유일하게 "지금 당장 막힌 사람"이 자발적으로 쓰는 종류의 글입니다.
 * 제보는 바로 공개되지 않고, 검수를 거쳐 변경 이력으로 승격되며 제보자 크레딧이 붙습니다.
 */
export function BreakageReports({ toolId }: { toolId: string }) {
  const { t } = useLanguage();
  const [reports, setReports] = useState<BreakageReport[]>([]);
  const [open, setOpen] = useState(false);
  const [occurredAt, setOccurredAt] = useState("");
  const [whatBroke, setWhatBroke] = useState("");
  const [workaround, setWorkaround] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/tools/${toolId}/breakage`);
      if (!response.ok) return;
      const data = await response.json();
      setReports(data.reports ?? []);
    } catch {
      /* 실패해도 본문은 그대로 읽혀야 합니다. */
    }
  }, [toolId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(occurredAt)) {
      setError(t.decisionNeedDate);
      return;
    }
    if (whatBroke.trim().length < 15) {
      setError(t.breakageNeedDetail);
      return;
    }
    setStatus("saving");
    setError("");
    try {
      const response = await fetch(`/api/tools/${toolId}/breakage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occurredAt, whatBroke, workaround })
      });
      if (!response.ok) {
        setError(t.saveFailed);
        setStatus("idle");
        return;
      }
      setStatus("done");
      setOccurredAt("");
      setWhatBroke("");
      setWorkaround("");
      setOpen(false);
      await load();
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setError(t.saveFailed);
      setStatus("idle");
    }
  };

  return (
    <details className="card breakage-card collapsible">
      <summary>
        {t.breakageTitle}
        <span className="summary-count">{reports.length}</span>
      </summary>
      <p className="text-muted section-lede">{t.breakageDesc}</p>

      {reports.length > 0 ? (
        <ul className="breakage-list">
          {reports.map((report) => (
            <li key={report.id}>
              <span className="breakage-date">{report.occurredAt}</span>
              <p>{report.whatBroke}</p>
              {report.workaround ? (
                <p className="text-muted">
                  <span className="cell-sublabel">{t.breakageWorkaround}</span> {report.workaround}
                </p>
              ) : null}
              <span className="breakage-credit">
                {t.breakageCredit} {report.authorHandle}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {open ? (
        <div className="decision-form">
          <label>
            <span>{t.breakageWhenLabel}</span>
            <input
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
              placeholder="2026-03"
              inputMode="numeric"
            />
          </label>
          <label>
            <span>{t.breakageWhatLabel}</span>
            <textarea
              rows={3}
              value={whatBroke}
              onChange={(event) => setWhatBroke(event.target.value)}
              placeholder={t.breakageWhatPlaceholder}
              maxLength={500}
            />
          </label>
          <label>
            <span>{t.breakageWorkaroundLabel}</span>
            <textarea
              rows={2}
              value={workaround}
              onChange={(event) => setWorkaround(event.target.value)}
              maxLength={500}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="dissent-form-actions">
            <button className="button" type="button" onClick={submit} disabled={status === "saving"}>
              {status === "saving" ? t.saving : t.breakageSubmit}
            </button>
            <button className="secondary-button" type="button" onClick={() => setOpen(false)}>
              {t.cancel}
            </button>
          </div>
        </div>
      ) : (
        <button className="secondary-button" type="button" onClick={() => setOpen(true)}>
          {t.breakageAdd}
        </button>
      )}

      {status === "done" ? <p className="form-success">{t.breakageThanks}</p> : null}
    </details>
  );
}
