"use client";

import Link from "next/link";
import type { Tool } from "@/lib/types";
import { VerdictBadgeList } from "@/components/VerdictBadgeList";
import { ProductLogo } from "@/components/ProductLogo";
import { GenrePillList } from "@/components/GenrePillList";
import { useLanguage } from "@/components/LanguageProvider";
import { CompareToggleButton } from "@/components/CompareToggleButton";

/**
 * 상세 페이지 히어로.
 *
 * 이전 순서는 kicker → 로고 → 도구명 → 고정 문구 → 설명 → 문제 배지 → 판단 배지였고,
 * 판단에 쓰이는 숫자(총점)는 949px, 한줄 총평은 2,096px 아래에 있었습니다.
 * 모바일 첫 화면(844px)에 결정 재료가 하나도 없었다는 뜻입니다.
 *
 * 이제 도구명 옆에 총점, 바로 아래에 한줄 총평이 옵니다.
 * 10개 도구가 전부 같았던 "TOOL FIELD NOTE" kicker와 "사람 중심 판단 리뷰" 문구는 뺐습니다.
 */
export function ToolHeader({ tool }: { tool: Tool }) {
  const { lang, t } = useLanguage();

  return (
    <section className="card tool-hero-card">
      <span className="section-kicker">TOOL FIELD NOTE</span>
      <div className="tool-title-row">
        <ProductLogo name={tool.name} size="lg" />
        <div className="tool-title-body">
          <h1>{tool.name}</h1>
          <small>
            {tool.category ? `${tool.category} · ` : ""}
            {lang === "ko" ? "사람 중심 판단 리뷰" : "Human-centered judgment review"}
          </small>
          {tool.discontinued ? <span className="badge discontinued-badge">{t.discontinuedLabel}</span> : null}
        </div>
      </div>
      <p>{tool.description}</p>
      <GenrePillList genres={tool.genres} />
      <div className="badge-list" aria-label={lang === "ko" ? "문제 상황" : "Problem contexts"}>
        {tool.problemContexts.map((context) => (
          <span className="badge context-badge" key={context}>
            {context}
          </span>
        ))}
      </div>
      <div className="tool-hero-footer">
        <VerdictBadgeList badges={tool.verdictBadges} />
        <div className="tool-hero-actions">
          <CompareToggleButton toolId={tool.id} />
          {tool.website ? (
            <a className="tool-website-link" href={tool.website} target="_blank" rel="noopener noreferrer">
              {t.websiteLabel} ↗
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
