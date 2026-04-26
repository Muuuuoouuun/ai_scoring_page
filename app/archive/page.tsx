"use client";

import { JournalArchiveSection } from "@/components/JournalArchiveSection";
import { useLanguage } from "@/components/LanguageProvider";

export default function ArchivePage() {
  const { lang } = useLanguage();

  return (
    <main className="archive-page">
      <section className="section archive-hero">
        <span className="section-kicker">EDITORIAL ARCHIVE</span>
        <h1>{lang === "ko" ? "결정의 흔적을 남기는 저널" : "A journal that keeps decision traces"}</h1>
        <p>
          {lang === "ko"
            ? "도구는 변하고, 좋은 판단의 기준도 계속 보정됩니다. 그 보정 과정을 아카이브합니다."
            : "Tools change, and good judgment gets recalibrated. This archive keeps that recalibration visible."}
        </p>
      </section>
      <JournalArchiveSection />
    </main>
  );
}
