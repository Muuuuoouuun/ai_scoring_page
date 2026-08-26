"use client";

import type { PatchNote } from "@/lib/insights";
import { copy as t } from "@/lib/copy";

/**
 * 읽기 전용 변경 이력입니다.
 *
 * 이전 버전에는 누구나 쓸 수 있는 입력 폼이 붙어 있었고, "회사 담당자가 남길 수 있습니다"라고
 * 안내했지만 실제로는 인증이 없었고 저장도 작성자 브라우저에만 됐습니다.
 * 검수 워크플로와 권한 모델이 준비되기 전까지는 입력을 열지 않습니다.
 */
export function PatchNotesSection({ notes }: { notes: PatchNote[] }) {

  const impactLabel: Record<PatchNote["impact"], string> = {
    high: t.patchImpactHigh,
    medium: t.patchImpactMedium,
    low: t.patchImpactLow
  };

  return (
    <section className="card patch-notes-card">
      <div className="patch-notes-head">
        <strong>{t.patchTitle}</strong>
        <p className="text-muted">{t.patchDesc}</p>
      </div>

      {notes.length === 0 ? (
        <p className="patch-empty">{t.patchEmpty}</p>
      ) : (
        <div className="patch-note-list">
          {notes.map((note, index) => (
            <article key={`${note.date}-${note.title}-${index}`} className="patch-note-item">
              <div className="patch-note-meta">
                <time dateTime={note.date}>{note.date}</time>
                <span className={`impact-pill ${note.impact}`}>{impactLabel[note.impact]}</span>
              </div>
              <h3>{note.title}</h3>
              <p>
                <span className="patch-note-label">{t.patchChange}</span> {note.change}
              </p>
              <p className="patch-note-risk">
                <span className="patch-note-label">{t.patchRisk}</span> {note.errorRisk}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
