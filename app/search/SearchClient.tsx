"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { genreMeta, getGenreLabel, toolGenres } from "@/lib/genres";
import type { Tool, ToolGenre } from "@/lib/types";
import { JournalIcon, type JournalIconName } from "@/components/JournalIcon";
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

const isToolGenre = (value: string): value is ToolGenre =>
  value === "ai" || value === "it" || value === "githubProject" || value === "saas";

const genreIcons: Record<ToolGenre, JournalIconName> = {
  ai: "spark",
  it: "grid",
  githubProject: "method",
  saas: "compass"
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
  const [selectedGenres, setSelectedGenres] = useState<ToolGenre[]>(
    searchParams.get("genres")?.split(",").filter(isToolGenre) ?? []
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (tagId) params.set("tag", tagId);
    if (teamSize) params.set("teamSize", teamSize);
    if (badges.length > 0) params.set("badges", badges.join(","));
    if (selectedGenres.length > 0) params.set("genres", selectedGenres.join(","));
    const paramString = params.toString();
    window.history.replaceState(null, "", paramString ? `/search?${paramString}` : "/search");
  }, [badges, problem, query, selectedGenres]);

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
        if (badges.length > 0) {
          if (!matchesBadges) {
            return { tool, score: -1 };
          }
          score += 1;
        }

        if (selectedGenres.length > 0) {
          const matchesGenres = selectedGenres.every((genre) => tool.genres.includes(genre));
          if (!matchesGenres) {
            return { tool, score: -1 };
          }
          score += 2;
        }

        return { tool, score };
      })
      .filter(
        ({ score }) =>
          score > 0 || (!query && !problem && badges.length === 0 && selectedGenres.length === 0)
      )
      .sort((a, b) => b.score - a.score)
      .map(({ tool }) => tool);
  }, [badges, problem, query, selectedGenres, tools]);
  const activeFilterCount =
    (query ? 1 : 0) + (problem ? 1 : 0) + badges.length + selectedGenres.length;
  const matchPercent = Math.round((results.length / Math.max(tools.length, 1)) * 100);
  const topResult = results[0];
  const activeFilters = [
    query
      ? {
          id: "query",
          label: `${t.searchKeyword}: ${query}`,
          clear: () => setQuery("")
        }
      : null,
    problem
      ? {
          id: "problem",
          label: `${t.searchProblem}: ${problem}`,
          clear: () => setProblem("")
        }
      : null,
    ...selectedGenres.map((genre) => ({
      id: `genre-${genre}`,
      label: getGenreLabel(genre, lang),
      clear: () => setSelectedGenres((current) => current.filter((item) => item !== genre))
    })),
    ...badges.map((badge) => {
      const label =
        badge === "timeSaver"
          ? t.verdict[0]
          : badge === "thinkCarefully"
            ? t.verdict[1]
            : t.verdict[2];

      return {
        id: `badge-${badge}`,
        label,
        clear: () => setBadges((current) => current.filter((item) => item !== badge))
      };
    })
  ].filter((filter): filter is { id: string; label: string; clear: () => void } => Boolean(filter));

  const toggleBadge = (badgeId: string) => {
    setBadges((current) =>
      current.includes(badgeId) ? current.filter((badge) => badge !== badgeId) : [...current, badgeId]
    );

  const toggleGenre = (genre: ToolGenre) => {
    setSelectedGenres((current) =>
      current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre]
    );
  };

  const clearFilters = () => {
    setQuery("");
    setTagId("");
    setTeamSize("");
    setBadges([]);
    setSelectedGenres([]);
  };

  const teamSizeOptions = t.teamSizes;
  const workTypeOptions = t.workTypes;
  const difficultyOptions = t.difficulties;

  return (
    <div className="section search-workbench">
      <aside className="search-panel search-control-panel" aria-label={t.searchFilterAria}>
        <div className="search-panel-head">
          <span className="section-kicker search-kicker">
            <JournalIcon name="search" />
            SIGNAL INPUT
          </span>
          <h2>{lang === "ko" ? "문제 문장을 먼저 적으세요" : "Start with the problem sentence"}</h2>
          <p className="text-muted">
            {lang === "ko"
              ? "키워드, 문제 상황, 판단 배지를 조합하면 결과가 바로 재정렬됩니다."
              : "Combine keywords, problem context, and judgment badges to reshape the result set."}
          </p>
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
          <div className="search-input-shell">
            <JournalIcon name="search" />
            <input
              id="search-keyword"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchKeywordPlaceholder}
              aria-label={t.searchKeyword}
            />
          </div>
        </div>
        <div className="search-form-group">
          <label className="search-form-label" htmlFor="search-problem">
            {t.searchProblem}
          </label>
          <div className="search-input-shell">
            <JournalIcon name="compass" />
            <input
              id="search-problem"
              value={problem}
              onChange={(event) => setProblem(event.target.value)}
              placeholder={t.searchProblemPlaceholder}
              aria-label={t.searchProblem}
            />
          </div>
        </div>
        <div className="chip-group" role="list" aria-label={lang === "ko" ? "빠른 문제 상황" : "Quick contexts"}>
          {problemContexts.map((context) => (
            <button
              type="button"
              className={`chip ${problem === context ? "active" : ""}`}
              key={context}
              onClick={() => setProblem(context)}
            >
              <JournalIcon name="spark" />
              {formatProblem(context)}
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
          <legend className="search-fieldset-legend">
            {lang === "ko" ? "장르로 필터링" : "Filter by genre"}
          </legend>
          <div className="genre-filter-grid">
            {toolGenres.map((genre) => (
              <button
                aria-pressed={selectedGenres.includes(genre)}
                className={`genre-filter-card ${selectedGenres.includes(genre) ? "active" : ""}`}
                key={genre}
                onClick={() => toggleGenre(genre)}
              type="button"
            >
                <span className="genre-filter-icon" aria-hidden="true">
                  <JournalIcon name={genreIcons[genre]} />
                </span>
                <span>
                  <strong>{getGenreLabel(genre, lang)}</strong>
                  <small>{genreMeta[genre].summary[lang]}</small>
                </span>
              </button>
            ))}
          </div>
        </fieldset>
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
                <span className="badge-option-icon" aria-hidden="true">
                  <JournalIcon
                    name={
                      badge.id === "lockinRisk"
                        ? "shield"
                        : badge.id === "thinkCarefully"
                          ? "radar"
                          : "spark"
                    }
                  />
                </span>
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
          <div className="search-gauge-card" aria-label={lang === "ko" ? "검색 매칭 게이지" : "Search match gauge"}>
            <div className="search-gauge-meta">
              <span>{lang === "ko" ? "매칭률" : "Match"}</span>
              <strong>{matchPercent}%</strong>
            </div>
            <div className="search-gauge-track" aria-hidden="true">
              <span style={{ width: `${matchPercent}%` }} />
            </div>
            <div className="search-gauge-foot">
              <span>{results.length}/{tools.length}</span>
              <span>{activeFilterCount} {lang === "ko" ? "필터" : "filters"}</span>
            </div>
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
        <div className="search-context-strip">
          <div>
            <span className="section-kicker">ACTIVE LENS</span>
            {activeFilters.length > 0 ? (
              <div className="active-filter-row" aria-label={lang === "ko" ? "활성 필터" : "Active filters"}>
                {activeFilters.map((filter) => (
                  <button key={filter.id} type="button" onClick={filter.clear}>
                    <span>{filter.label}</span>
                    <strong aria-hidden="true">x</strong>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted">
                {lang === "ko" ? "필터 없이 전체 도구를 점검 중입니다." : "Scanning the full tool set without filters."}
              </p>
            )}
          </div>
          {topResult ? (
            <div className="top-match-note">
              <small>{lang === "ko" ? "상위 매칭" : "Top match"}</small>
              <strong>{topResult.name}</strong>
              <span>{topResult.problemContexts[0]}</span>
            </div>
          ) : null}
        </div>
        <div className="grid grid-3 search-result-grid">
          {results.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {selected.length > 0 ? <CompareBar /> : null}
    </div>
  );
}
