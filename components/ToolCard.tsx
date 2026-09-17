"use client";

import Link from "next/link";
import type { Tool } from "@/lib/types";
import { getToolInsight } from "@/lib/insights";
import { VerdictBadgeList } from "@/components/VerdictBadgeList";
import { ProductLogo } from "@/components/ProductLogo";
import { StarRating } from "@/components/StarRating";
import { TierChip } from "@/components/TierChip";
import { CompareToggleButton } from "@/components/CompareToggleButton";
import { useLanguage } from "@/components/LanguageProvider";

export function ToolCard({ tool, variant = "default" }: { tool: Tool; variant?: "default" | "feature" }) {
  const { t } = useLanguage();
  const insight = getToolInsight(tool);

  return (
    <article className={`card tool-card tool-card-${variant}`}>
      <div className="tool-card-meta">
        <span>{tool.category ?? "FIELD NOTE"}</span>
        <span>{insight.rank ? `#${insight.rank.overall} / ${insight.rank.total}` : `${insight.totalScore}/100`}</span>
      </div>
      <div className="tool-card-head">
        <ProductLogo name={tool.name} size="md" />
        <strong>{tool.name}</strong>
      </div>
      <div className="tool-card-score-row">
        <StarRating value={insight.score.stars} size="sm" />
        <TierChip tier={insight.score.tier} size="sm" />
        {tool.discontinued ? <span className="badge discontinued-badge">{t.discontinuedLabel}</span> : null}
        <span className="tool-card-total">
          {insight.totalScore}
          <small>/100</small>
        </span>
      </div>
      <div>
        <p className="tool-card-desc">{tool.description}</p>
      </div>
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
        <CompareToggleButton toolId={tool.id} />
      </div>
    </article>
  );
}
