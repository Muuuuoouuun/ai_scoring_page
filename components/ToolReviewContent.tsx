"use client";

import { useState } from "react";
import type { Tool } from "@/lib/types";
import type { ToolInsight } from "@/lib/insights";
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
import { KeyFeaturesCard } from "@/components/KeyFeaturesCard";
import { ExternalRatingsCard } from "@/components/ExternalRatingsCard";
import { SourceReferences } from "@/components/SourceReferences";
import { useLanguage } from "@/components/LanguageProvider";
import { DiscussionContent } from "@/components/DiscussionContent";
import { CommunityContent } from "@/components/CommunityContent";

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
  const [activeTab, setActiveTab] = useState<"review" | "discussion" | "community">("review");

  return (
    <main className="tool-review-page">
      <section className="tool-detail-hero-grid">
        <ToolHeader tool={tool} />
        <ScoreBreakdownCard
          totalScore={insight.totalScore}
          scoreBreakdown={insight.scoreBreakdown}
          variant="hero"
          note={insight.isResearched ? t.scoreNote : undefined}
        />
      </section>

      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "review" ? "active" : ""}`}
          onClick={() => setActiveTab("review")}
        >
          {t.tabReview}
        </button>
        <button
          className={`tab-btn ${activeTab === "discussion" ? "active" : ""}`}
          onClick={() => setActiveTab("discussion")}
        >
          {t.tabDiscussion}
        </button>
        <button
          className={`tab-btn ${activeTab === "community" ? "active" : ""}`}
          onClick={() => setActiveTab("community")}
        >
          {t.tabCommunity}
        </button>
      </div>

      {activeTab === "review" && (
        <div className="tab-content review-grid-layout">
          <div className="review-main-column">
            <section className="section card">
              <strong>{t.whyExists}</strong>
              <p>{tool.whyExist}</p>
            </section>
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
            <BestWorstNarratives bestCase={tool.bestCase} worstCase={tool.worstCase} />
            <OneLineReviewForm toolId={tool.id} />
            <PatchNotesSection toolId={tool.id} notes={insight.patchNotes} />
            <SourceReferences sources={insight.sources} researchedAt={insight.researchedAt} />
          </div>

          <aside className="review-sidebar-column">
            <WorkUsageGuide playbook={insight.workPlaybook} />
            <ImpactMeterGrid impact={tool.impact} />
            <ExternalRatingsCard ratings={insight.externalRatings} researchedAt={insight.researchedAt} />
            <CapabilityComparisonTable toolName={tool.name} rows={insight.comparisons} />
            <AlternativesSection alternatives={tool.alternatives} />
          </aside>
        </div>
      )}

      {activeTab === "discussion" && <DiscussionContent tool={tool} />}
      {activeTab === "community" && <CommunityContent tool={tool} />}

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
