"use client";

import { useEffect, useState } from "react";
import type { Tool } from "@/lib/types";
import type { SignalBenchmark, ToolInsight } from "@/lib/insights";
import { ToolHeader } from "@/components/ToolHeader";
import { BestWorstNarratives } from "@/components/BestWorstNarratives";
import { AlternativesSection } from "@/components/AlternativesSection";
import { RelatedTools } from "@/components/RelatedTools";
import { ScoreBreakdownCard } from "@/components/ScoreBreakdownCard";
import { CapabilityComparisonTable } from "@/components/CapabilityComparisonTable";
import { FeatureChecklistSection } from "@/components/FeatureChecklistSection";
import { PatchNotesSection } from "@/components/PatchNotesSection";
import { WorkUsageGuide } from "@/components/WorkUsageGuide";
import { KeyFeaturesCard } from "@/components/KeyFeaturesCard";
import { ExternalRatingsCard } from "@/components/ExternalRatingsCard";
import { SourceReferences } from "@/components/SourceReferences";
import { RatingSummaryCard } from "@/components/RatingSummaryCard";
import { useLanguage } from "@/components/LanguageProvider";
import { DiscussionContent } from "@/components/DiscussionContent";
import { CommunityContent } from "@/components/CommunityContent";
import { ToolKnowledgePanels } from "@/components/ToolKnowledgePanels";

const toolTabs = ["review", "discussion", "community"] as const;

type ToolTab = (typeof toolTabs)[number];

function isToolTab(value: string | null): value is ToolTab {
  return toolTabs.some((tab) => tab === value);
}

function getToolTabFromUrl(): ToolTab {
  if (typeof window === "undefined") {
    return "review";
  }

  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  return isToolTab(view) ? view : "review";
}

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
  insight,
  benchmark
}: {
  tool: Tool;
  related: Tool[];
  insight: ToolInsight;
  benchmark: SignalBenchmark;
}) {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ToolTab>(() => getToolTabFromUrl());
  const tabItems: Array<{ id: ToolTab; code: string; label: string; summary: string }> = [
    {
      id: "review",
      code: "01",
      label: t.tabReview,
      summary: lang === "ko" ? "총점, 근거, 실무 가이드" : "Score, evidence, and playbook"
    },
    {
      id: "discussion",
      code: "02",
      label: t.tabDiscussion,
      summary: lang === "ko" ? "쟁점과 도입 판단" : "Debates and adoption calls"
    },
    {
      id: "community",
      code: "03",
      label: t.tabCommunity,
      summary: lang === "ko" ? "현장 리뷰와 업데이트" : "Field reviews and updates"
    }
  ];

  useEffect(() => {
    const syncTabFromUrl = () => {
      setActiveTab(getToolTabFromUrl());
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);

    return () => {
      window.removeEventListener("popstate", syncTabFromUrl);
    };
  }, []);

  const selectTab = (nextTab: ToolTab) => {
    setActiveTab(nextTab);

    const url = new URL(window.location.href);
    if (nextTab === "review") {
      url.searchParams.delete("view");
    } else {
      url.searchParams.set("view", nextTab);
    }

    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };

  return (
    <main id="main-content" className="tool-review-page">
      <section className="tool-detail-hero-grid">
        <ToolHeader tool={tool} />
        <ScoreBreakdownCard
          totalScore={insight.totalScore}
          scoreBreakdown={insight.scoreBreakdown}
          variant="hero"
          note={insight.isResearched ? t.scoreNote : undefined}
          score={insight.score}
          rank={insight.rank}
        />
      </section>

      <div className="tabs-nav journal-tabs-nav" role="tablist" aria-label={lang === "ko" ? "도구 리뷰 섹션" : "Tool review sections"}>
        {tabItems.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              aria-controls={`${tab.id}-panel`}
              aria-selected={isActive}
              className={`tab-btn ${isActive ? "active" : ""}`}
              id={`${tab.id}-tab`}
              key={tab.id}
              onClick={() => selectTab(tab.id)}
              role="tab"
              type="button"
            >
              <span className="tab-btn-code" aria-hidden="true">
                {tab.code}
              </span>
              <span className="tab-btn-copy">
                <strong>{tab.label}</strong>
                <small>{tab.summary}</small>
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === "review" && (
        <div
          aria-labelledby="review-tab"
          className="tab-content review-grid-layout"
          id="review-panel"
          role="tabpanel"
        >
          <div className="review-main-column">
            <section className="section card">
              <strong>{t.whyExists}</strong>
              <p>{tool.whyExist}</p>
            </section>
            <ScoreBreakdownCard totalScore={insight.totalScore} scoreBreakdown={insight.scoreBreakdown} />
            <section className="card">
              <strong>{t.reviewSummary}</strong>
              <p>{insight.oneLine}</p>
              {insight.researchedAt ? (
                <small className="research-stamp">
                  {t.researchedAt}: {insight.researchedAt}
                </small>
              ) : null}
            </section>
            <KeyFeaturesCard
              features={insight.keyFeatures}
              pricingSummary={insight.pricingSummary}
              koreaNote={insight.koreaNote}
            />
            <CapabilityComparisonTable toolId={tool.id} toolName={tool.name} rows={insight.comparisons} />
            <BestWorstNarratives bestCase={tool.bestCase} worstCase={tool.worstCase} />
            <CapabilityComparisonTable toolName={tool.name} rows={insight.comparisons} />
            <OneLineReviewForm toolId={tool.id} />
            <PatchNotesSection toolId={tool.id} notes={insight.patchNotes} />
            <SourceReferences sources={insight.sources} researchedAt={insight.researchedAt} />
          </div>

          <aside className="review-sidebar-column">
            <RatingSummaryCard toolId={tool.id} score={insight.score} rank={insight.rank} />
            <WorkUsageGuide playbook={insight.workPlaybook} />
            <ImpactMeterGrid impact={tool.impact} />
            <ExternalRatingsCard ratings={insight.externalRatings} researchedAt={insight.researchedAt} />
            <AlternativesSection alternatives={tool.alternatives} />
          </aside>
        </div>
      )}

      {activeTab === "discussion" && (
        <div aria-labelledby="discussion-tab" id="discussion-panel" role="tabpanel">
          <DiscussionContent tool={tool} />
        </div>
      )}
      {activeTab === "community" && (
        <div aria-labelledby="community-tab" id="community-panel" role="tabpanel">
          <CommunityContent tool={tool} />
        </div>
      )}

      <ToolKnowledgePanels tool={tool} benchmark={benchmark} />

      <section className="section">
        <h2>{t.relatedTools}</h2>
        <p className="text-muted">{t.relatedDesc}</p>
        <div className="grid grid-3">
          {related.map((item) => (
            <ToolCard key={item.id} tool={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
