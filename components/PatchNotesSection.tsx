"use client";

import { useEffect, useMemo, useState } from "react";
import type { PatchNote } from "@/lib/insights";
import type { PatchUpdate } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import { ADMIN_USER_ID } from "@/lib/admin";

const IMPACT_CLASS: Record<string, string> = {
  high: "impact-high",
  medium: "impact-medium",
  low: "impact-low"
};

function toPatchNote(p: PatchUpdate): PatchNote {
  return {
    date: p.patchDate,
    title: p.title,
    change: p.change,
    errorRisk: p.errorRisk,
    impact: p.impact,
    isOutage: p.isOutage
  };
}

export function PatchNotesSection({
  toolId,
  notes
}: {
  toolId: string;
  notes: PatchNote[];
}) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [change, setChange] = useState("");
  const [errorRisk, setErrorRisk] = useState("");
  const [impact, setImpact] = useState<"high" | "medium" | "low">("medium");
  const [isOutage, setIsOutage] = useState(false);
  const [serverNotes, setServerNotes] = useState<PatchNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const combinedNotes = useMemo(
    () => [...serverNotes, ...notes],
    [serverNotes, notes]
  );

  useEffect(() => {
    fetch(`/api/patch-notes?toolId=${encodeURIComponent(toolId)}`)
      .then((res) => res.json())
      .then((data) => setServerNotes((data.patches ?? []).map(toPatchNote)))
      .catch(() => {});
  }, [toolId]);

  const onAdd = async () => {
    if (!title || !change || !errorRisk || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/patch-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": ADMIN_USER_ID
        },
        body: JSON.stringify({ toolId, title, change, errorRisk, impact, isOutage })
      });
      if (!res.ok) return;
      const { patch } = await res.json();
      setServerNotes((prev) => [toPatchNote(patch), ...prev]);
      setTitle("");
      setChange("");
      setErrorRisk("");
      setImpact("medium");
      setIsOutage(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const impactLabel = (val?: "high" | "medium" | "low") => {
    if (!val) return null;
    const map = { high: t.patchImpactHigh, medium: t.patchImpactMedium, low: t.patchImpactLow };
    return map[val];
  };

  return (
    <section className="card">
      <strong>{t.patchTitle}</strong>
      <p>{t.patchDesc}</p>

      <div className="grid">
        {combinedNotes.map((note, index) => (
          <article key={`${note.date}-${note.title}-${index}`} className="patch-note-item">
            <div className="patch-note-meta">
              <small>{note.date}</small>
              {note.impact ? (
                <span className={`patch-impact-badge ${IMPACT_CLASS[note.impact]}`}>
                  {t.patchImpact}: {impactLabel(note.impact)}
                </span>
              ) : null}
              {note.isOutage ? (
                <span className="patch-outage-badge">{t.patchIsOutage}</span>
              ) : null}
            </div>
            <h3>{note.title}</h3>
            <p>
              <strong>{t.patchChange}:</strong> {note.change}
            </p>
            <p>
              <strong>{t.patchRisk}:</strong> {note.errorRisk}
            </p>
          </article>
        ))}
      </div>

      <div className="grid">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t.patchTitleInput}
        />
        <textarea
          value={change}
          onChange={(event) => setChange(event.target.value)}
          rows={3}
          placeholder={t.patchChangeInput}
        />
        <textarea
          value={errorRisk}
          onChange={(event) => setErrorRisk(event.target.value)}
          rows={3}
          placeholder={t.patchRiskInput}
        />
        <div className="patch-form-row">
          <label className="form-field-label">{t.patchImpact}</label>
          <select
            value={impact}
            onChange={(e) => setImpact(e.target.value as "high" | "medium" | "low")}
            className="patch-impact-select"
          >
            <option value="high">{t.patchImpactHigh}</option>
            <option value="medium">{t.patchImpactMedium}</option>
            <option value="low">{t.patchImpactLow}</option>
          </select>
          <label className="patch-outage-label">
            <input
              type="checkbox"
              checked={isOutage}
              onChange={(e) => setIsOutage(e.target.checked)}
            />
            {t.patchIsOutage}
          </label>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={onAdd}
          disabled={loading}
        >
          {saved ? `✓ ${t.saved}` : t.patchAdd}
        </button>
      </div>
    </section>
  );
}
