"use client";

import type { SourceReference } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

const hostnameOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

export function SourceReferences({
  sources,
  researchedAt
}: {
  sources: SourceReference[];
  researchedAt: string;
}) {
  const { t } = useLanguage();

  if (sources.length === 0) {
    return null;
  }

  return (
    <section className="card source-references-card">
      <span className="section-kicker">REFERENCES</span>
      <strong>{t.sourcesTitle}</strong>
      <p className="text-muted">
        {t.sourcesDesc}
        {researchedAt ? ` (${t.researchedAt}: ${researchedAt})` : ""}
      </p>
      <ol className="source-list">
        {sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.label}
            </a>
            <small>{hostnameOf(source.url)}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}
