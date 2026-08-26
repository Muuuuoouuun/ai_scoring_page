"use client";

import Link from "next/link";
import type { Tool } from "@/lib/types";
import { ProductLogo } from "@/components/ProductLogo";
import { getTotalScore } from "@/lib/insights";
import { copy as t } from "@/lib/copy";

/**
 * 관련 도구를 카드가 아니라 행으로 보여줍니다.
 *
 * 이전에는 홈과 동일한 풀사이즈 카드 3장이 모바일에서 1,157px를 차지했습니다.
 * 이 자리는 비교로 넘어가는 진입점이면 충분하므로 로고·이름·총평 한 줄·총점만 남깁니다.
 */
export function RelatedTools({ tools }: { tools: Tool[] }) {

  return (
    <section className="section">
      <h2>{t.relatedTools}</h2>
      <div className="related-list">
        {tools.map((tool) => (
          <Link className="related-row" href={`/tools/${tool.id}`} key={tool.id}>
            <ProductLogo name={tool.name} size="sm" />
            <span className="related-row-body">
              <strong>{tool.name}</strong>
              <span>{tool.review.verdict}</span>
            </span>
            <span className="related-row-score">
              {getTotalScore(tool.review.scoreBreakdown)}
              <small>/100</small>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
