"use client";

import { useEffect, useState } from "react";
import type { Tool } from "@/lib/types";
import type { SignalBenchmark, ToolInsight } from "@/lib/insights";
import { ToolHeader } from "@/components/ToolHeader";
import { ImpactMeterGrid } from "@/components/ImpactMeterGrid";
import { BestWorstNarratives } from "@/components/BestWorstNarratives";
import { AlternativesSection } from "@/components/AlternativesSection";
import { ToolCard } from "@/components/ToolCard";
import { ScoreBreakdownCard } from "@/components/ScoreBreakdownCard";
import { CapabilityComparisonTable } from "@/components/CapabilityComparisonTable";
import { PatchNotesSection } from "@/components/PatchNotesSection";
import { OneLineReviewForm } from "@/components/OneLineReviewForm";
import { WorkUsageGuide } from "@/components/WorkUsageGuide";
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
    <main className="tool-review-page">
      <section className="tool-detail-hero-grid">
        <ToolHeader tool={tool} />
        <ScoreBreakdownCard totalScore={insight.totalScore} scoreBreakdown={insight.scoreBreakdown} variant="hero" />
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
            <section className="card">
              <strong>{t.reviewSummary}</strong>
              <p>{insight.oneLine}</p>
            </section>
            <BestWorstNarratives bestCase={tool.bestCase} worstCase={tool.worstCase} />
            <OneLineReviewForm toolId={tool.id} />
            <PatchNotesSection toolId={tool.id} notes={insight.patchNotes} />
          </div>

          <aside className="review-sidebar-column">
            <WorkUsageGuide playbook={insight.workPlaybook} />
            <ImpactMeterGrid impact={tool.impact} benchmark={benchmark} />
            <CapabilityComparisonTable toolName={tool.name} rows={insight.comparisons} />
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
        <div className="grid grid-3">
          {related.map((item) => (
            <ToolCard key={item.id} tool={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
