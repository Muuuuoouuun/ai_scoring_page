"use client";

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
import { useLanguage } from "@/components/LanguageProvider";

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
      <ToolHeader tool={tool} />
      <section className="section card">
        <strong>{t.whyExists}</strong>
        <p>{tool.whyExist}</p>
      </section>
      <ScoreBreakdownCard totalScore={insight.totalScore} scoreBreakdown={insight.scoreBreakdown} />
      <section className="card">
        <strong>{t.reviewSummary}</strong>
        <p>{insight.oneLine}</p>
      </section>
      <ImpactMeterGrid impact={tool.impact} />
      <BestWorstNarratives bestCase={tool.bestCase} worstCase={tool.worstCase} />
      <CapabilityComparisonTable toolName={tool.name} rows={insight.comparisons} />
      <AlternativesSection alternatives={tool.alternatives} />
      <WorkUsageGuide playbook={insight.workPlaybook} />
      <OneLineReviewForm toolId={tool.id} />
      <PatchNotesSection toolId={tool.id} notes={insight.patchNotes} />
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
