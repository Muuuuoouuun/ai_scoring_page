"use client";

import { useEffect, useMemo, useState } from "react";
import type { PatchNote } from "@/lib/insights";
import { useLanguage } from "@/components/LanguageProvider";

const storageKey = (toolId: string) => `g2-company-patch-notes-${toolId}`;

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
  const [localNotes, setLocalNotes] = useState<PatchNote[]>([]);

  const combinedNotes = useMemo(() => [...localNotes, ...notes], [localNotes, notes]);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey(toolId));
    if (!raw) return;
    const parsed = JSON.parse(raw) as PatchNote[];
    setLocalNotes(parsed);
  }, [toolId]);

  const onAdd = () => {
    if (!title || !change || !errorRisk) return;
    const entry: PatchNote = {
      date: new Date().toISOString().slice(0, 10),
      title,
      change,
      errorRisk
    };
    const next = [entry, ...localNotes];
    setLocalNotes(next);
    localStorage.setItem(storageKey(toolId), JSON.stringify(next));
    setTitle("");
    setChange("");
    setErrorRisk("");
  };

  return (
    <section className="card">
      <strong>{t.patchTitle}</strong>
      <p>{t.patchDesc}</p>
      <div className="grid">
        {combinedNotes.map((note, index) => (
          <article key={`${note.date}-${note.title}-${index}`} className="patch-note-item">
            <small>{note.date}</small>
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
      <div className="patch-note-form">
        <label className="form-field">
          <span className="form-field-label">{t.patchTitleInput}</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t.patchTitleInput}
          />
        </label>
        <label className="form-field">
          <span className="form-field-label">{t.patchChangeInput}</span>
          <textarea
            value={change}
            onChange={(event) => setChange(event.target.value)}
            rows={3}
            placeholder={t.patchChangeInput}
          />
        </label>
        <label className="form-field">
          <span className="form-field-label">{t.patchRiskInput}</span>
          <textarea
            value={errorRisk}
            onChange={(event) => setErrorRisk(event.target.value)}
            rows={3}
            placeholder={t.patchRiskInput}
          />
        </label>
        <button className="secondary-button" type="button" onClick={onAdd}>
          {t.patchAdd}
        </button>
      </div>
    </section>
  );
}
