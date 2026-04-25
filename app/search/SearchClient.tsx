"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Tool } from "@/lib/types";
import { ToolCard } from "@/components/ToolCard";
import { useLanguage } from "@/components/LanguageProvider";

const badgeDescriptions = {
  ko: [
    "불필요한 반복을 줄여 실행 속도를 높입니다.",
    "설정과 운영 원칙이 없으면 품질 저하가 생길 수 있습니다.",
    "데이터 이동 비용이나 전환 비용이 높습니다."
  ],
  en: [
    "Speeds up execution by reducing repetitive work.",
    "Needs clear rules to avoid quality drift.",
    "Switching cost or data gravity can be high."
  ]
} as const;

const formatProblem = (problem: string) => problem;

export default function SearchClient({
  tools,
  problemContexts
}: {
  tools: Tool[];
  problemContexts: string[];
}) {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [problem, setProblem] = useState(searchParams.get("problem") ?? "");
  const [badges, setBadges] = useState<string[]>(
    searchParams.get("badges")?.split(",").filter(Boolean) ?? []
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (problem) params.set("problem", problem);
    if (badges.length > 0) params.set("badges", badges.join(","));
    const paramString = params.toString();
    window.history.replaceState(null, "", paramString ? `/search?${paramString}` : "/search");
  }, [badges, problem, query]);

  const results = useMemo(() => {
    const queryLower = query.toLowerCase();
    const problemLower = problem.toLowerCase();

    return tools
      .map((tool) => {
        let score = 0;
        const text = [
          tool.name,
          tool.description,
          tool.whyExist,
          ...tool.problemContexts,
          tool.bestCase,
          tool.worstCase
        ]
          .join(" ")
          .toLowerCase();

        if (queryLower && text.includes(queryLower)) {
          score += 2;
        }
        if (problemLower) {
          const matchesProblem = tool.problemContexts.some((context) =>
            context.toLowerCase().includes(problemLower)
          );
          if (matchesProblem) {
            score += 3;
          }
        }

        const matchesBadges = badges.every(
          (badge) => tool.verdictBadges[badge as keyof Tool["verdictBadges"]]
        );
        if (matchesBadges && badges.length > 0) {
          score += 1;
        }

        return { tool, score };
      })
      .filter(({ score }) => score > 0 || (!query && !problem && badges.length === 0))
      .sort((a, b) => b.score - a.score)
      .map(({ tool }) => tool);
  }, [badges, problem, query, tools]);

  const toggleBadge = (badgeId: string) => {
    setBadges((current) =>
      current.includes(badgeId) ? current.filter((badge) => badge !== badgeId) : [...current, badgeId]
    );
  };

  const clearFilters = () => {
    setQuery("");
    setProblem("");
    setBadges([]);
  };

  return (
    <div className="section search-workbench">
      <aside className="search-panel search-control-panel" aria-label={lang === "ko" ? "도구 검색 및 필터" : "Search and filter tools"}>
        <div className="search-panel-head">
          <span className="section-kicker">SIGNAL INPUT</span>
          <h2>{lang === "ko" ? "문제 문장을 먼저 적으세요" : "Start with the problem sentence"}</h2>
          <p className="text-muted">
            {lang === "ko"
              ? "키워드, 문제 상황, 판단 배지를 조합하면 결과가 바로 재정렬됩니다."
              : "Combine keywords, problem context, and judgment badges to reshape the result set."}
          </p>
        </div>
        <div className="search-form-group">
          <label className="search-form-label" htmlFor="search-keyword">
            {t.searchKeyword}
          </label>
          <input
            id="search-keyword"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchKeywordPlaceholder}
            aria-label={t.searchKeyword}
          />
        </div>
        <div className="search-form-group">
          <label className="search-form-label" htmlFor="search-problem">
            {t.searchProblem}
          </label>
          <input
            id="search-problem"
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
            placeholder={t.searchProblemPlaceholder}
            aria-label={t.searchProblem}
          />
        </div>
        <div className="chip-group" role="list" aria-label={lang === "ko" ? "빠른 문제 상황" : "Quick contexts"}>
          {problemContexts.map((context) => (
            <button
              type="button"
              className={`chip ${problem === context ? "active" : ""}`}
              key={context}
              onClick={() => setProblem(context)}
            >
              {formatProblem(context)}
            </button>
          ))}
        </div>
        <fieldset className="search-fieldset">
          <legend className="search-fieldset-legend">{t.searchFilterLegend}</legend>
          <div className="badge-filter">
            {[
              { id: "timeSaver", label: t.verdict[0], description: badgeDescriptions[lang][0] },
              { id: "thinkCarefully", label: t.verdict[1], description: badgeDescriptions[lang][1] },
              { id: "lockinRisk", label: t.verdict[2], description: badgeDescriptions[lang][2] }
            ].map((badge) => (
              <label key={badge.id} className="badge-option">
                <input
                  type="checkbox"
                  checked={badges.includes(badge.id)}
                  onChange={() => toggleBadge(badge.id)}
                />
                <div className="badge-option-content">
                  <span>{badge.label}</span>
                  <small>{badge.description}</small>
                </div>
              </label>
            ))}
          </div>
        </fieldset>
        <button className="secondary-button" type="button" onClick={clearFilters}>
          {t.clearFilters}
        </button>
      </aside>
      <section className="search-results-panel">
        <div className="results-toolbar">
          <div>
            <span className="section-kicker">MATCH MATRIX</span>
            <h2>{t.results}</h2>
            <p>
              <strong>{results.length}</strong> {t.matchCount}
            </p>
          </div>
          <div className="result-count-card" aria-label={lang === "ko" ? "현재 검색 결과 수" : "Current result count"}>
            <strong>{results.length}</strong>
            <span>{lang === "ko" ? "signals" : "matches"}</span>
          </div>
        </div>
        {results.length === 0 ? (
          <div className="card">
            <strong>{t.noMatch}</strong>
            <p>{t.noMatchDesc}</p>
          </div>
        ) : null}
        <div className="grid grid-3 search-result-grid">
          {results.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
