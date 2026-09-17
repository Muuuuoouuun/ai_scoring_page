"use client";

import Link from "next/link";
import type { Tool, ToolProblemAngle } from "@/lib/types";
import { VerdictBadgeList } from "@/components/VerdictBadgeList";
import { ProductLogo } from "@/components/ProductLogo";
import { useLanguage } from "@/components/LanguageProvider";
import { getToolMeta } from "@/lib/insights";

export function ToolCard({ tool }: { tool: Tool }) {
  const { t } = useLanguage();
  const meta = getToolMeta(tool.id);

  return (
    <article className={`card tool-card tool-card-${variant} ${picked ? "is-picked" : ""}`}>
      <div className="tool-card-head">
        <ProductLogo name={tool.name} size="md" />
        <div className="tool-card-title">
          <strong>{tool.name}</strong>
          <span className="tool-card-score" aria-label={`${t.scoreTitle} ${total}`}>
            {total}
            <small>/100</small>
          </span>
        </div>
      </div>

      {/*
        문제로 검색해 들어온 경우, 왜 이게 나왔는지를 카드에서 바로 말해줍니다.
        이전에는 검색 결과 카드가 홈 카드와 완전히 동일해서 매칭 이유가 한 줄도 없었습니다.
      */}
      {angle ? (
        <div className="tool-card-angle">
          <p className="angle-yes">
            <span className="angle-mark" aria-hidden="true">
              ✓
            </span>
            {angle.angle}
          </p>
          <p className="angle-no">
            <span className="angle-mark" aria-hidden="true">
              !
            </span>
            {angle.limitation}
          </p>
        </div>
      ) : (
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
        {selectable ? (
          <button
            type="button"
            className={`compare-toggle ${picked ? "active" : ""}`}
            onClick={() => toggle(tool.id)}
            disabled={!picked && isFull}
            aria-pressed={picked}
          >
            {picked ? t.compareRemove : t.compareAdd}
          </button>
        ) : null}
      </div>
    </article>
  );
}
