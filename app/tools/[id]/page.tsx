import { notFound } from "next/navigation";
import { tools } from "@/data/tools";
import { ToolReviewContent } from "@/components/ToolReviewContent";
import { getToolInsight } from "@/lib/insights";

export default function ToolReviewPage({ params }: { params: { id: string } }) {
  const tool = tools.find((item) => item.id === params.id);
  if (!tool) {
    notFound();
  }

  const related = tools.filter((item) => item.id !== tool.id).slice(0, 3);
  const insight = getToolInsight(tool);

  return <ToolReviewContent tool={tool} related={related} insight={insight} />;
}
