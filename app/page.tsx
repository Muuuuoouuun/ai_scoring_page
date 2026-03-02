"use client";

import { Hero } from "@/components/Hero";
import { PrinciplesBar } from "@/components/PrinciplesBar";
import { ProblemCategoryList } from "@/components/ProblemCategoryList";
import { ToolCard } from "@/components/ToolCard";
import { useLanguage } from "@/components/LanguageProvider";
import { tools } from "@/data/tools";

export default function HomePage() {
  const { t } = useLanguage();
  const featured = tools.slice(0, 3);

  return (
    <main>
      <Hero />
      <ProblemCategoryList />
      <section className="section">
        <h2 className="section-title">{t.featuredTitle}</h2>
        <div className="grid grid-3">
          {featured.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
      <PrinciplesBar />
    </main>
  );
}
