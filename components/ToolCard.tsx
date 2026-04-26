"use client";

import Link from "next/link";
import type { Tool } from "@/lib/types";
import { VerdictBadgeList } from "@/components/VerdictBadgeList";
import { ProductLogo } from "@/components/ProductLogo";
import { GenrePillList } from "@/components/GenrePillList";
import { useLanguage } from "@/components/LanguageProvider";

export function ToolCard({ tool, variant = "default" }: { tool: Tool; variant?: "default" | "feature" }) {
  const { t } = useLanguage();
  const signalScore =
    Math.round(
      (Object.values(tool.impact).reduce((sum, value) => sum + value, 0) / Object.values(tool.impact).length) * 10
    ) / 10;

  return (
    <article className={`card tool-card tool-card-${variant}`}>
      <div className="tool-card-meta">
        <span>FIELD NOTE</span>
        <span>{signalScore}/10</span>
      </div>
      <div className="tool-card-head">
        <ProductLogo name={tool.name} size="md" />
        <strong>{tool.name}</strong>
      </div>
      <div>
        <p className="tool-card-desc">{tool.description}</p>
      </div>
      <GenrePillList genres={tool.genres} />
      <VerdictBadgeList badges={tool.verdictBadges} />
      <div className="tool-card-wave" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="tool-card-footer">
        <Link className="tool-link" href={`/tools/${tool.id}`}>
          {t.readReview}
        </Link>
      </div>
    </article>
  );
}
