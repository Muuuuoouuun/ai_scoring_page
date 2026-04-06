"use client";

import Link from "next/link";
import type { Tool } from "@/lib/types";
import { VerdictBadgeList } from "@/components/VerdictBadgeList";
import { ProductLogo } from "@/components/ProductLogo";
import { useLanguage } from "@/components/LanguageProvider";
import { getToolMeta } from "@/lib/insights";

export function ToolCard({ tool }: { tool: Tool }) {
  const { t } = useLanguage();
  const meta = getToolMeta(tool.id);

  return (
    <article className="card tool-card">
      <div className="tool-card-head">
        <ProductLogo name={tool.name} size="md" />
        <strong>{tool.name}</strong>
      </div>
      <div>
        <p className="tool-card-desc">{tool.description}</p>
        {meta?.shortDiff ? (
          <p className="tool-card-diff">
            <span className="tool-card-diff-label">{t.shortDiffLabel}</span>
            {meta.shortDiff}
          </p>
        ) : null}
      </div>
      <VerdictBadgeList badges={tool.verdictBadges} />
      <div className="tool-card-footer">
        <Link className="tool-link" href={`/tools/${tool.id}`}>
          {t.readReview}
        </Link>
      </div>
    </article>
  );
}
