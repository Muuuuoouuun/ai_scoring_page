"use client";

import { useEffect, useMemo, useState } from "react";
import type { PatchNote } from "@/lib/insights";
import type { PatchUpdate } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import { ADMIN_USER_ID } from "@/lib/admin";

function toPatchNote(p: PatchUpdate): PatchNote {
  return { date: p.patchDate, title: p.title, change: p.change, errorRisk: p.errorRisk };
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
        body: JSON.stringify({ toolId, title, change, errorRisk })
      });
      if (!res.ok) return;
      const { patch } = await res.json();
      setServerNotes((prev) => [toPatchNote(patch), ...prev]);
      setTitle("");
      setChange("");
      setErrorRisk("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
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
