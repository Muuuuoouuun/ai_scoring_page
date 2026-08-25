"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ToolCard } from "@/components/ToolCard";
import { CompareBar } from "@/components/CompareBar";
import { useLanguage } from "@/components/LanguageProvider";
import { useCompare } from "@/components/CompareProvider";
import { searchTools } from "@/lib/tools";
import { getRankedTags, getTagLabel, getTag, countToolsForTag } from "@/lib/problems";
import type { TeamSizeBand } from "@/lib/types";

const TEAM_BANDS: TeamSizeBand[] = ["1-5", "6-30", "30+"];

export default function SearchClient() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();
  const { selected } = useCompare();

  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [tagId, setTagId] = useState(searchParams.get("tag") ?? "");
  const [teamSize, setTeamSize] = useState(searchParams.get("teamSize") ?? "");
  const [badges, setBadges] = useState<string[]>(
    searchParams.get("badges")?.split(",").filter(Boolean) ?? []
  );

  const tags = useMemo(() => getRankedTags(), []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (tagId) params.set("tag", tagId);
    if (teamSize) params.set("teamSize", teamSize);
    if (badges.length > 0) params.set("badges", badges.join(","));
    const paramString = params.toString();
    window.history.replaceState(null, "", paramString ? `/search?${paramString}` : "/search");
  }, [badges, tagId, query, teamSize]);

  /**
   * 검색 로직은 lib/tools.ts 한 곳에만 있습니다.
   * 이전에는 이 파일과 서버에 각각 한 벌씩 있었고 동작이 서로 달랐습니다.
   */
  const results = useMemo(
    () =>
      searchTools({
        query: query || undefined,
        tagId: tagId || undefined,
        teamSize: teamSize || undefined,
        badges: badges.length
          ? Object.fromEntries(badges.map((badge) => [badge, true]))
          : undefined
      }),
    [badges, tagId, query, teamSize]
  );

  const activeTag = tagId ? getTag(tagId) : undefined;

  const toggleBadge = (badgeId: string) =>
    setBadges((current) =>
      current.includes(badgeId) ? current.filter((badge) => badge !== badgeId) : [...current, badgeId]
    );

  const clearFilters = () => {
    setQuery("");
    setTagId("");
    setTeamSize("");
    setBadges([]);
  };

  const hasFilter = Boolean(query || tagId || teamSize || badges.length);

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
                  <span className="tag-chip-label">{getTagLabel(tag, lang)}</span>
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

        <fieldset className="search-fieldset">
          <legend className="search-fieldset-legend">{t.teamSizeLegend}</legend>
          <div className="segmented" role="group">
            {TEAM_BANDS.map((band) => (
              <button
                type="button"
                key={band}
                className={teamSize === band ? "active" : ""}
                onClick={() => setTeamSize(teamSize === band ? "" : band)}
                aria-pressed={teamSize === band}
              >
                {t.teamSizeLabels[band]}
              </button>
            ))}
          </div>
          <p className="field-hint">{t.teamSizeHint}</p>
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
            <h2>{activeTag ? getTagLabel(activeTag, lang) : t.results}</h2>
            <p className="text-muted">
              {activeTag ? activeTag.description : `${results.length}${t.matchCount}`}
            </p>
          </div>
          <div className="result-count-card">
            <strong>{results.length}</strong>
            <span>{lang === "ko" ? "개 후보" : "candidates"}</span>
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
