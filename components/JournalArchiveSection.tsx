"use client";

import Link from "next/link";
import { JournalIcon } from "@/components/JournalIcon";
import { useLanguage } from "@/components/LanguageProvider";
import { journalArchiveEntries } from "@/lib/editorial";

export function JournalArchiveSection({ compact = false }: { compact?: boolean }) {
  const { lang } = useLanguage();
  const entries = compact ? journalArchiveEntries.slice(0, 2) : journalArchiveEntries;

  return (
    <section className={`section journal-archive-section ${compact ? "journal-archive-compact" : ""}`}>
      <div className="journal-section-head journal-section-head-row">
        <div>
          <span className="section-kicker">
            <JournalIcon name="archive" />
            JOURNAL ARCHIVE
          </span>
          <h2 className="section-title">{lang === "ko" ? "큐레이션 블로그 기록" : "Curation blog records"}</h2>
        </div>
        {compact ? (
          <Link className="tool-link" href="/blog">
            {lang === "ko" ? "블로그 전체 보기 →" : "Open blog →"}
          </Link>
        ) : (
          <p className="text-muted">
            {lang === "ko"
              ? "기능 소개로는 놓치는 운영 윤리, 실패 패턴, 벤치마크 해석을 모았습니다."
              : "Operational ethics, failure patterns, and benchmark interpretation beyond feature lists."}
          </p>
        )}
      </div>
      <div className="archive-entry-grid">
        {entries.map((entry) => (
          <article className="archive-entry-card" key={entry.id}>
            <div className="archive-entry-meta">
              <span>{entry.tag[lang]}</span>
              <strong>{entry.signal}</strong>
            </div>
            <h3>{entry.title[lang]}</h3>
            <p>{entry.summary[lang]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
