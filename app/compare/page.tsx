"use client";

import { ComparisonWorkbench } from "@/components/ComparisonWorkbench";
import { useLanguage } from "@/components/LanguageProvider";
import { tools } from "@/data/tools";

export default function ComparePage() {
  const { lang } = useLanguage();

  return (
    <main className="compare-page">
      <section className="section search-journal-hero">
        <span className="section-kicker">TOOL COMPARISON MATRIX</span>
        <h1>{lang === "ko" ? "후보를 나란히 놓고 결정하세요" : "Place candidates side by side before deciding"}</h1>
        <p>
          {lang === "ko"
            ? "zip 참고안의 비교 트레이, 지표 슬라이더, 추천 검색 흐름을 실제 검색 데이터에 연결했습니다."
            : "The comparison tray, marker sliders, and recommendation flow are connected to live tool data."}
        </p>
      </section>
      <ComparisonWorkbench tools={tools} />
    </main>
  );
}
