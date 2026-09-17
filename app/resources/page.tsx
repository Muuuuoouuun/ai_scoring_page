"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { ResourceDirectory } from "@/components/ResourceDirectory";

export default function ResourcesPage() {
  const { t } = useLanguage();

  return (
    <main className="resources-page">
      <section className="section resources-hero">
        <span className="section-kicker">USEFUL SITES</span>
        <h1>{t.resourcesTitle}</h1>
        <p className="text-muted">{t.resourcesDesc}</p>
      </section>
      <ResourceDirectory />
    </main>
  );
}
