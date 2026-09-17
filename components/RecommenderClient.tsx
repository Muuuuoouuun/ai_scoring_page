"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { tools } from "@/data/tools";
import { ROLES, TEAM_SIZES, type Role, type TeamSize } from "@/lib/types";
import { getCapabilityProfile, getToolInsight } from "@/lib/insights";
import {
  CONSTRAINTS,
  MAX_PRIORITIES,
  PRIORITIES,
  recommendTools,
  type Constraint,
  type Priority
} from "@/lib/recommend";
import { useLanguage } from "@/components/LanguageProvider";
import { ProductLogo } from "@/components/ProductLogo";
import { StarRating } from "@/components/StarRating";
import { TierChip } from "@/components/TierChip";
import { CompareToggleButton } from "@/components/CompareToggleButton";

export default function RecommenderClient() {
  const { t, lang } = useLanguage();
  const [role, setRole] = useState<Role | undefined>(undefined);
  const [teamSize, setTeamSize] = useState<TeamSize | undefined>(undefined);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [constraints, setConstraints] = useState<Constraint[]>([]);

  const togglePriority = (priority: Priority) =>
    setPriorities((current) => {
      if (current.includes(priority)) return current.filter((item) => item !== priority);
      if (current.length >= MAX_PRIORITIES) return [...current.slice(1), priority];
      return [...current, priority];
    });

  const toggleConstraint = (constraint: Constraint) =>
    setConstraints((current) =>
      current.includes(constraint) ? current.filter((item) => item !== constraint) : [...current, constraint]
    );

  const results = useMemo(
    () =>
      recommendTools(
        tools,
        { role, teamSize, priorities, constraints },
        { insightOf: getToolInsight, profileOf: getCapabilityProfile, lang },
        6
      ),
    [role, teamSize, priorities, constraints, lang]
  );

  return (
    <div className="section recommend-workbench">
      <aside className="search-panel recommend-panel" aria-label={t.recommendTitle}>
        <div className="recommend-group">
          <span className="search-form-label">{t.recommendRole}</span>
          <div className="chip-group" role="group">
            <button type="button" className={`chip ${role === undefined ? "active" : ""}`} onClick={() => setRole(undefined)}>
              {t.recommendAny}
            </button>
            {ROLES.map((item, index) => (
              <button
                key={item}
                type="button"
                className={`chip ${role === item ? "active" : ""}`}
                onClick={() => setRole(item)}
                aria-pressed={role === item}
              >
                {t.roles[index]}
              </button>
            ))}
          </div>
        </div>
        <div className="recommend-group">
          <span className="search-form-label">{t.recommendTeam}</span>
          <div className="chip-group" role="group">
            <button type="button" className={`chip ${teamSize === undefined ? "active" : ""}`} onClick={() => setTeamSize(undefined)}>
              {t.recommendAny}
            </button>
            {TEAM_SIZES.map((item, index) => (
              <button
                key={item}
                type="button"
                className={`chip ${teamSize === item ? "active" : ""}`}
                onClick={() => setTeamSize(item)}
                aria-pressed={teamSize === item}
              >
                {t.teamSizes[index]}
              </button>
            ))}
          </div>
        </div>
        <div className="recommend-group">
          <span className="search-form-label">{t.recommendPriority}</span>
          <div className="chip-group" role="group">
            {PRIORITIES.map((item, index) => (
              <button
                key={item}
                type="button"
                className={`chip ${priorities.includes(item) ? "active" : ""}`}
                onClick={() => togglePriority(item)}
                aria-pressed={priorities.includes(item)}
              >
                {t.priorities[index]}
              </button>
            ))}
          </div>
        </div>
        <fieldset className="search-fieldset">
          <legend className="search-fieldset-legend">{t.recommendConstraint}</legend>
          <div className="badge-filter">
            {CONSTRAINTS.map((item, index) => (
              <label key={item} className="badge-option">
                <input type="checkbox" checked={constraints.includes(item)} onChange={() => toggleConstraint(item)} />
                <div className="badge-option-content">
                  <span>{t.constraints[index]}</span>
                </div>
              </label>
            ))}
          </div>
        </fieldset>
      </aside>

      <section className="recommend-results" aria-live="polite">
        <div className="results-toolbar">
          <div>
            <span className="section-kicker">FIT RANKING</span>
            <h2>{t.recommendResults}</h2>
          </div>
        </div>
        <ol className="recommend-list">
          {results.map((result, index) => (
            <li key={result.tool.id} className="card recommend-item">
              <div className="recommend-item-head">
                <span className="recommend-rank">{index + 1}</span>
                <ProductLogo name={result.tool.name} size="md" />
                <div className="recommend-item-title">
                  <Link href={`/tools/${result.tool.id}`}>{result.tool.name}</Link>
                  <small>{result.tool.category}</small>
                </div>
                <div className="recommend-fit" aria-label={`${t.fitLabel} ${result.fit}%`}>
                  <span className="recommend-fit-number">
                    {result.fit}
                    <small>%</small>
                  </span>
                  <span className="recommend-fit-bar" aria-hidden="true">
                    <span style={{ width: `${result.fit}%` }} />
                  </span>
                  <small>{t.fitLabel}</small>
                </div>
              </div>
              <div className="recommend-item-score">
                <StarRating value={result.insight.score.stars} size="sm" />
                <TierChip tier={result.insight.score.tier} size="sm" />
                <span className="text-muted">
                  {t.scoreComposite} {result.insight.totalScore}
                </span>
              </div>
              <p className="tool-card-desc">{result.tool.description}</p>
              <div className="recommend-item-columns">
                <div>
                  <span className="usage-label recommend-label">{t.reasonsLabel}</span>
                  <ul className="recommend-reasons">
                    {result.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
                {result.warnings.length > 0 ? (
                  <div>
                    <span className="usage-label recommend-label">{t.warningsLabel}</span>
                    <ul className="recommend-warnings">
                      {result.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
              <div className="tool-card-footer">
                <Link className="tool-link" href={`/tools/${result.tool.id}`}>
                  {t.readReview}
                </Link>
                <CompareToggleButton toolId={result.tool.id} />
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
