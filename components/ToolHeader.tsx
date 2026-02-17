"use client";

import type { Tool } from "@/lib/types";
import { VerdictBadgeList } from "@/components/VerdictBadgeList";
import { ProductLogo } from "@/components/ProductLogo";
import { useLanguage } from "@/components/LanguageProvider";

export function ToolHeader({ tool }: { tool: Tool }) {
  const { lang } = useLanguage();

  return (
    <section className="card">
      <div className="tool-title-row">
        <ProductLogo name={tool.name} size="lg" />
        <h1>{tool.name}</h1>
      </div>
      <p>{tool.description}</p>
      <div className="badge-list" aria-label={lang === "ko" ? "문제 상황" : "Problem contexts"}>
        {tool.problemContexts.map((context) => (
          <span className="badge context-badge" key={context}>
            {context}
          </span>
        ))}
      </div>
      <VerdictBadgeList badges={tool.verdictBadges} />
    </section>
  );
}
