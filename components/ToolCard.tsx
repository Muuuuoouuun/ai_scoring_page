"use client";

import Link from "next/link";
import type { Tool } from "@/lib/types";
import { VerdictBadgeList } from "@/components/VerdictBadgeList";
import { ProductLogo } from "@/components/ProductLogo";
import { useLanguage } from "@/components/LanguageProvider";

export function ToolCard({ tool }: { tool: Tool }) {
  const { t } = useLanguage();

  return (
    <article className="card tool-card">
      <div className="tool-card-head">
        <ProductLogo name={tool.name} size="md" />
        <strong>{tool.name}</strong>
      </div>
      <div>
        <p>{tool.description}</p>
      </div>
      <VerdictBadgeList badges={tool.verdictBadges} />
      <div>
        <Link className="tool-link" href={`/tools/${tool.id}`}>
          {t.readReview}
        </Link>
      </div>
    </article>
  );
}
