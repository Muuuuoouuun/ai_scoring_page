import { notFound } from "next/navigation";
import { tools } from "@/data/tools";
import { ToolReviewContent } from "@/components/ToolReviewContent";
import { getToolInsight, getToolSignalBenchmark } from "@/lib/insights";

export default function ToolReviewPage({ params }: { params: { id: string } }) {
  const tool = tools.find((item) => item.id === params.id);
  if (!tool) {
    notFound();
  }

  const related = tools.filter((item) => item.id !== tool.id).slice(0, 3);
  const insight = getToolInsight(tool);
  const benchmark = getToolSignalBenchmark(tool, tools);

  return <ToolReviewContent tool={tool} related={related} insight={insight} benchmark={benchmark} />;
}
