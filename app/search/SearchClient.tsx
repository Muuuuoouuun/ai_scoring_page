"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ToolCard } from "@/components/ToolCard";
import { useLanguage } from "@/components/LanguageProvider";
import { getToolMeta } from "@/lib/insights";

const TEAM_BANDS: TeamSizeBand[] = ["1-5", "6-30", "30+"];

const TEAM_SIZE_META: Record<string, string[]> = {
  "1-10명": ["1-10"],
  "10-100명": ["10-100"],
  "100명+": ["100+"],
  "1-10": ["1-10"],
  "10-100": ["10-100"],
  "100+": ["100+"]
};

const WORK_TYPE_META: Record<string, string> = {
  "엔지니어링": "engineering", "Engineering": "engineering",
  "디자인": "design", "Design": "design",
  "마케팅": "marketing", "Marketing": "marketing",
  "운영/기획": "operations", "Operations": "operations",
  "영업": "sales", "Sales": "sales"
};

const DIFFICULTY_META: Record<string, string> = {
  "쉬움": "easy", "Easy": "easy",
  "보통": "medium", "Medium": "medium",
  "어려움": "hard", "Hard": "hard"
};

export default function SearchClient({
  tools,
  problemContexts
}: {
  tools: Tool[];
  problemContexts: string[];
}) {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();
  const { selected } = useCompare();

  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [tagId, setTagId] = useState(searchParams.get("tag") ?? "");
  const [teamSize, setTeamSize] = useState(searchParams.get("teamSize") ?? "");
  const [badges, setBadges] = useState<string[]>(
    searchParams.get("badges")?.split(",").filter(Boolean) ?? []
  );
  const [teamSize, setTeamSize] = useState(searchParams.get("teamSize") ?? "");
  const [workType, setWorkType] = useState(searchParams.get("workType") ?? "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") ?? "");

  const tags = useMemo(() => getRankedTags(), []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (tagId) params.set("tag", tagId);
    if (teamSize) params.set("teamSize", teamSize);
    if (badges.length > 0) params.set("badges", badges.join(","));
    if (teamSize) params.set("teamSize", teamSize);
    if (workType) params.set("workType", workType);
    if (difficulty) params.set("difficulty", difficulty);
    const paramString = params.toString();
    router.replace(paramString ? `/search?${paramString}` : "/search");
  }, [badges, problem, query, router, teamSize, workType, difficulty]);

  const results = useMemo(() => {
    const queryLower = query.toLowerCase();
    const problemLower = problem.toLowerCase();
    const targetWorkType = workType ? WORK_TYPE_META[workType] : null;
    const targetDifficulty = difficulty ? DIFFICULTY_META[difficulty] : null;

    return tools
      .map((tool) => {
        let score = 0;
        const meta = getToolMeta(tool.id);
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

        if (queryLower && text.includes(queryLower)) score += 2;

        if (problemLower) {
          const matchesProblem = tool.problemContexts.some((ctx) =>
            ctx.toLowerCase().includes(problemLower)
          );
          if (matchesProblem) score += 3;
        }

        const matchesBadges = badges.every(
          (badge) => tool.verdictBadges[badge as keyof Tool["verdictBadges"]]
        );
        if (matchesBadges && badges.length > 0) score += 1;

        // meta filters — hard filters (exclude if mismatch)
        if (meta) {
          if (teamSize) {
            const metaKey = TEAM_SIZE_META[teamSize]?.[0];
            if (metaKey && meta.teamSize !== "any" && meta.teamSize !== metaKey) {
              return { tool, score: -1 };
            }
          }
          if (targetWorkType && meta.workType !== "any" && meta.workType !== targetWorkType) {
            return { tool, score: -1 };
          }
          if (targetDifficulty && meta.onboardingDifficulty !== targetDifficulty) {
            return { tool, score: -1 };
          }
        }

        return { tool, score };
      })
      .filter(({ score }) => {
        if (score < 0) return false;
        return score > 0 || (!query && !problem && badges.length === 0 && !teamSize && !workType && !difficulty);
      })
      .sort((a, b) => b.score - a.score)
      .map(({ tool }) => tool);
  }, [badges, difficulty, problem, query, teamSize, tools, workType]);

  const toggleBadge = (badgeId: string) => {
    setBadges((current) =>
      current.includes(badgeId) ? current.filter((badge) => badge !== badgeId) : [...current, badgeId]
    );

  const clearFilters = () => {
    setQuery("");
    setTagId("");
    setTeamSize("");
    setBadges([]);
    setTeamSize("");
    setWorkType("");
    setDifficulty("");
  };

  const teamSizeOptions = t.teamSizes;
  const workTypeOptions = t.workTypes;
  const difficultyOptions = t.difficulties;

  return (
    <div className="section search-workbench">
      <aside className="search-panel search-control-panel" aria-label={t.searchFilterAria}>
        <div className="search-panel-head">
          <span className="section-kicker">SIGNAL INPUT</span>
          <h2>{t.searchPanelTitle}</h2>
          <p className="text-muted">{t.searchPanelDesc}</p>
        </div>

        <fieldset className="search-fieldset">
          <legend className="search-fieldset-legend">{t.searchProblem}</legend>
          <div className="tag-list" role="list">
            {tags.map((tag) => {
              const count = countToolsForTag(tag.id);
              const active = tagId === tag.id;
              return (
                <button
                  type="button"
                  role="listitem"
                  className={`tag-chip ${active ? "active" : ""}`}
                  key={tag.id}
                  onClick={() => setTagId(active ? "" : tag.id)}
                  aria-pressed={active}
                >
                  <span className="tag-chip-label">{getTagLabel(tag)}</span>
                  <span className="tag-chip-count">{count}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="search-form-group">
          <label className="search-form-label" htmlFor="search-keyword">
            {t.searchKeyword}
          </label>
          <input
            id="search-keyword"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchKeywordPlaceholder}
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
              {context}
            </button>
          ))}
        </div>

        {/* 메타 필터 */}
        <div className="meta-filter-row">
          <div className="search-form-group">
            <label className="search-form-label">{t.filterTeamSize}</label>
            <select value={teamSize} onChange={(e) => setTeamSize(e.target.value)}>
              <option value="">{t.filterAll}</option>
              {teamSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="search-form-group">
            <label className="search-form-label">{t.filterWorkType}</label>
            <select value={workType} onChange={(e) => setWorkType(e.target.value)}>
              <option value="">{t.filterAll}</option>
              {workTypeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="search-form-group">
            <label className="search-form-label">{t.filterDifficulty}</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="">{t.filterAll}</option>
              {difficultyOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="search-fieldset">
          <legend className="search-fieldset-legend">{t.searchFilterLegend}</legend>
          <div className="badge-filter">
            {[
              { id: "timeSaver", label: t.verdict[0], description: t.badgeDesc[0] },
              { id: "thinkCarefully", label: t.verdict[1], description: t.badgeDesc[1] },
              { id: "lockinRisk", label: t.verdict[2], description: t.badgeDesc[2] }
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

        {hasFilter ? (
          <button className="secondary-button" type="button" onClick={clearFilters}>
            {t.clearFilters}
          </button>
        ) : null}
      </aside>

      <section className="search-results-panel">
        <div className="results-toolbar">
          <div>
            <span className="section-kicker">MATCH MATRIX</span>
            <h2>{activeTag ? getTagLabel(activeTag) : t.results}</h2>
            <p className="text-muted">
              {activeTag ? activeTag.description : `${results.length}${t.matchCount}`}
            </p>
          </div>
          <div className="result-count-card">
            <strong>{results.length}</strong>
            <span>{"개 후보"}</span>
          </div>
        </div>

        {activeTag && results.length >= 2 ? (
          <p className="compare-hint">{t.compareHint}</p>
        ) : null}

        {results.length === 0 ? (
          <div className="card empty-state">
            <strong>{t.noMatch}</strong>
            <p>{t.noMatchDesc}</p>
            {hasFilter ? (
              <button className="secondary-button" type="button" onClick={clearFilters}>
                {t.clearFilters}
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-2 search-result-grid">
          {results.map(({ tool, angle }) => (
            <ToolCard key={tool.id} tool={tool} angle={angle} selectable />
          ))}
        </div>
      </section>

      {selected.length > 0 ? <CompareBar /> : null}
    </div>
  );
}
