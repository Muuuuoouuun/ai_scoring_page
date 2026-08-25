"use client";

import type { Tool } from "@/lib/types";
import type { ToolInsight } from "@/lib/insights";
import { ToolHeader } from "@/components/ToolHeader";
import { ImpactMeterGrid } from "@/components/ImpactMeterGrid";
import { BestWorstNarratives } from "@/components/BestWorstNarratives";
import { AlternativesSection } from "@/components/AlternativesSection";
import { RelatedTools } from "@/components/RelatedTools";
import { ScoreBreakdownCard } from "@/components/ScoreBreakdownCard";
import { CapabilityComparisonTable } from "@/components/CapabilityComparisonTable";
import { PatchNotesSection } from "@/components/PatchNotesSection";
import { WorkUsageGuide } from "@/components/WorkUsageGuide";
import { AdoptionFacts } from "@/components/AdoptionFacts";
import { ReviewProvenance } from "@/components/ReviewProvenance";
import { ScoreDissent } from "@/components/community/ScoreDissent";
import { DecisionRecords } from "@/components/community/DecisionRecords";
import { BreakageReports } from "@/components/community/BreakageReports";
import { useLanguage } from "@/components/LanguageProvider";

/**
 * 상세 페이지 구성.
 *
 * 이전에는 "리뷰 / 토론 / 커뮤니티" 탭이 있었고 뒤의 두 개는 "준비 중" 문구만 있었습니다.
 * 응답이 0이면 죽은 탭이 됩니다. 탭을 없애고 커뮤니티를 문맥에 인라인으로 넣었습니다.
 *   · 점수에 대한 이의 → 점수 근거 바로 옆
 *   · 도입 결정 기록 → 대안 이야기가 나오는 자리
 *   · 고장 제보 → 변경 이력 아래
 * 결과적으로 모바일 페이지 길이도 함께 줄었습니다.
 *
 * 순서는 "떨어뜨리기 → 이해하기 → 비교하기 → 기여하기"입니다.
 * 결정권자가 가장 먼저 하는 행동이 고르기가 아니라 떨어뜨리기이기 때문입니다.
 */
export function ToolReviewContent({
  tool,
  related,
  insight
}: {
  tool: Tool;
  related: Tool[];
  insight: ToolInsight;
}) {
  const { t } = useLanguage();

  return (
    <main className="tool-review-page">
      <section className="tool-detail-hero-grid">
        <ToolHeader tool={tool} />
        <ScoreBreakdownCard
          totalScore={insight.totalScore}
          scoreBreakdown={insight.scoreBreakdown}
          variant="hero"
        />
      </section>

      <ReviewProvenance meta={tool.review.reviewMeta} />

      <div className="review-grid-layout">
        <div className="review-main-column">
          <AdoptionFacts tool={tool} />

          <ScoreDissent toolId={tool.id} scoreBreakdown={insight.scoreBreakdown} />

          <section className="card">
            <strong>{t.whyExists}</strong>
            <p>{tool.whyExist}</p>
          </section>

          <BestWorstNarratives bestCase={tool.bestCase} worstCase={tool.worstCase} />

          <CapabilityComparisonTable toolName={tool.name} rows={insight.comparisons} />

          <DecisionRecords toolId={tool.id} toolName={tool.name} />

          <PatchNotesSection notes={insight.patchNotes} />
          <BreakageReports toolId={tool.id} />
        </div>

        <aside className="review-sidebar-column">
          <WorkUsageGuide playbook={insight.workPlaybook} />
          <ImpactMeterGrid impact={tool.impact} />
          <AlternativesSection alternatives={tool.alternatives} />
        </aside>
      </div>

      <RelatedTools tools={related} />
    </main>
  );
}
