"use client";

import Link from "next/link";
import type { Tool } from "@/lib/types";
import { VerdictBadgeList } from "@/components/VerdictBadgeList";
import { ProductLogo } from "@/components/ProductLogo";
import { useLanguage } from "@/components/LanguageProvider";

const IMPACT_ORDER: (keyof Tool["impact"])[] = [
  "judgmentSpeed",
  "thinkingDepth",
  "executionDensity",
  "collaborationClarity"
];

export function ToolCard({ tool, variant = "default" }: { tool: Tool; variant?: "default" | "feature" }) {
  const { lang, t } = useLanguage();
  const values = Object.values(tool.impact);
  const signalScore = Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
  const tone = signalScore >= 7 ? "high" : signalScore >= 5.5 ? "mid" : "low";

  return (
    <article className={`card tool-card tool-card-${variant}`}>
      <div className="tool-card-meta">
        <span>FIELD NOTE</span>
        <span className={`score-chip score-chip-${tone}`}>
          <b>{signalScore}</b>
          <small>/10</small>
        </span>
      </div>
      <div className="tool-card-head">
        <ProductLogo name={tool.name} size="md" />
        <strong>{tool.name}</strong>
      </div>
      <p className="tool-card-desc">{tool.description}</p>
      {variant === "feature" ? (
        <>
          <p className="tool-card-why">{tool.whyExist}</p>
          <div className="badge-list" aria-label={lang === "ko" ? "문제 상황" : "Problem contexts"}>
            {tool.problemContexts.slice(0, 3).map((context) => (
              <span className="badge context-badge" key={context}>
                {context}
              </span>
            ))}
          </div>
        </>
      ) : null}
      <VerdictBadgeList badges={tool.verdictBadges} />
      <div className="tool-card-footer">
        <div
          className="impact-sparks"
          role="img"
          aria-label={`${t.impactTitle} ${IMPACT_ORDER.map((key, i) => `${t.impactLabels[i]} ${tool.impact[key]}`).join(", ")}`}
        >
          {IMPACT_ORDER.map((key) => (
            <span key={key} style={{ height: `${Math.max(12, tool.impact[key] * 10)}%` }} />
          ))}
          <em>{lang === "ko" ? "임팩트" : "impact"}</em>
        </div>
        <Link className="tool-link" href={`/tools/${tool.id}`}>
          {t.readReview}
        </Link>
      </div>
    </article>
  );
}
