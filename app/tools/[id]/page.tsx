import { notFound } from "next/navigation";
import { tools } from "@/data/tools";
import { ToolReviewContent } from "@/components/ToolReviewContent";
import { getCapabilityProfile, getToolInsight } from "@/lib/insights";
import { recommendSimilar } from "@/lib/recommend";

export default function ToolReviewPage({ params }: { params: { id: string } }) {
  const tool = tools.find((item) => item.id === params.id);
  if (!tool) {
    notFound();
  }

  const related = recommendSimilar(tool, tools, 3, getCapabilityProfile);
  const insight = getToolInsight(tool);
  const benchmark = getToolSignalBenchmark(tool, tools);

  return <ToolReviewContent tool={tool} related={related} insight={insight} benchmark={benchmark} />;
}
