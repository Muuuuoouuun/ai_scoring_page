"use client";

import { useEffect, useMemo, useState } from "react";
import type { PatchNote } from "@/lib/insights";
import { ADMIN_USER_ID } from "@/lib/admin";
import type { PatchImpact, PatchUpdate } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

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
  const [impact, setImpact] = useState<PatchImpact>("medium");
  const [hasIncident, setHasIncident] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [serverNotes, setServerNotes] = useState<PatchUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const combinedNotes = useMemo<PatchNote[]>(
    () => [...serverNotes, ...notes],
    [serverNotes, notes]
  );

  const impactLabels: Record<PatchImpact, string> = {
    low: t.patchImpactLow,
    medium: t.patchImpactMedium,
    high: t.patchImpactHigh
  };

  useEffect(() => {
    let cancelled = false;

    const loadPatches = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/tool/${toolId}/patches`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load patches");
        const data = (await response.json()) as { patches: PatchUpdate[] };
        if (!cancelled) setServerNotes(data.patches);
      } catch {
        if (!cancelled) setError(t.patchLoadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadPatches();
    return () => {
      cancelled = true;
    };
  }, [toolId, t.patchLoadError]);

  const onAdd = async () => {
    if (!title || !change || !errorRisk) return;

    setSaving(true);
    setStatus("");
    setError("");

    try {
      const response = await fetch(`/api/tool/${toolId}/patches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": ADMIN_USER_ID,
          "x-user-nickname": authorName.trim() || "Admin User"
        },
        body: JSON.stringify({
          title,
          change,
          errorRisk,
          impact,
          hasIncident,
          authorName
        })
      });

      if (!response.ok) throw new Error("Failed to save patch");

      const data = (await response.json()) as { patch: PatchUpdate };
      setServerNotes((current) => [data.patch, ...current]);
      setTitle("");
      setChange("");
      setErrorRisk("");
      setImpact("medium");
      setHasIncident(false);
      setAuthorName("");
      setStatus(t.patchSaved);
      setTimeout(() => setStatus(""), 2000);
    } catch {
      setError(t.patchSaveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card">
      <strong>{t.patchTitle}</strong>
      <p>{t.patchDesc}</p>
      {loading ? <small className="text-muted">{t.patchLoading}</small> : null}
      {error ? <p className="form-status error">{error}</p> : null}
      {status ? <p className="form-status success">{status}</p> : null}
      <div className="grid">
        {combinedNotes.map((note, index) => (
          <article key={`${note.date}-${note.title}-${index}`} className="patch-note-item">
            <div className="patch-note-meta">
              <small>{note.date}</small>
              <span className={`impact-pill ${note.impact ?? "medium"}`}>
                {impactLabels[note.impact ?? "medium"]}
              </span>
              {note.hasIncident ? <span className="incident-pill">{t.patchIncidentLabel}</span> : null}
            </div>
            <h3>{note.title}</h3>
            <p>
              <strong>{t.patchChange}:</strong> {note.change}
            </p>
            <p>
              <strong>{t.patchRisk}:</strong> {note.errorRisk}
            </p>
            {note.authorName ? <small className="text-muted">{t.patchAuthor}: {note.authorName}</small> : null}
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
        <div className="form-row">
          <select
            value={impact}
            onChange={(event) => setImpact(event.target.value as PatchImpact)}
            aria-label={t.patchImpact}
          >
            <option value="low">{t.patchImpactLow}</option>
            <option value="medium">{t.patchImpactMedium}</option>
            <option value="high">{t.patchImpactHigh}</option>
          </select>
          <input
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            maxLength={40}
            placeholder={t.patchAuthorInput}
          />
        </div>
        <label className="checkbox-line">
          <input
            type="checkbox"
            checked={hasIncident}
            onChange={(event) => setHasIncident(event.target.checked)}
          />
          <span>{t.patchIncident}</span>
        </label>
        <button className="secondary-button" type="button" onClick={onAdd} disabled={saving}>
          {saving ? t.patchSaving : t.patchAdd}
        </button>
      </div>
    </section>
  );
}
