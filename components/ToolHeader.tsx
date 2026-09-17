"use client";

import Link from "next/link";
import type { Tool } from "@/lib/types";
import { VerdictBadgeList } from "@/components/VerdictBadgeList";
import { ProductLogo } from "@/components/ProductLogo";
import { GenrePillList } from "@/components/GenrePillList";
import { useLanguage } from "@/components/LanguageProvider";

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
  const total = getTotalScore(tool.review.scoreBreakdown);

  return (
    <section className="card tool-hero-card">
      <div className="tool-title-row">
        <ProductLogo name={tool.name} size="lg" />
        <div className="tool-title-body">
          <h1>{tool.name}</h1>
          <span className="tool-hero-score">
            {total}
            <small>/100</small>
          </span>
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
      <VerdictBadgeList badges={tool.verdictBadges} />

      <p className="tool-hero-desc">{tool.description}</p>

      <div className="badge-list" aria-label={"문제 상황"}>
        {tool.problemTagIds.map((tagId) => {
          const tag = getTag(tagId);
          if (!tag) return null;
          return (
            <Link className="badge context-badge" key={tagId} href={`/search?tag=${tagId}`}>
              {getTagLabel(tag)}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
