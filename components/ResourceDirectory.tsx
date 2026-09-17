"use client";

import { useMemo, useState } from "react";
import type { CapabilityLevel, ResourceGroup, ResourcePricing, ResourceSite } from "@/lib/types";
import { RESOURCE_GROUPS } from "@/lib/types";
import { resources } from "@/data/resources";
import { filterResources, groupResources } from "@/lib/resources";
import { useLanguage } from "@/components/LanguageProvider";
import { ProductLogo } from "@/components/ProductLogo";

const PRICING_INDEX: Record<ResourcePricing, number> = { free: 0, freemium: 1, paid: 2 };
const KOREAN_INDEX: Record<CapabilityLevel, number> = { full: 0, partial: 1, none: 2 };

function ResourceCard({ site }: { site: ResourceSite }) {
  const { t } = useLanguage();

  return (
    <article className="card resource-card">
      <div className="resource-card-head">
        <ProductLogo name={site.name} size="sm" />
        <div className="resource-card-title">
          <a href={site.url} target="_blank" rel="noopener noreferrer">
            {site.name}
          </a>
          <small>{site.tagline}</small>
        </div>
      </div>
      <div className="resource-chip-row">
        <span className={`badge resource-pricing resource-pricing-${site.pricing}`}>
          {t.resourcePricing[PRICING_INDEX[site.pricing]]}
        </span>
        <span className={`badge resource-korean resource-korean-${site.koreanFriendly}`}>
          {t.resourceKorean[KOREAN_INDEX[site.koreanFriendly]]}
        </span>
      </div>
      <dl className="resource-detail">
        <dt>{t.resourceUseCase}</dt>
        <dd>{site.useCase}</dd>
        <dt>{t.resourceStrength}</dt>
        <dd className="resource-strength">{site.strength}</dd>
        <dt>{t.resourceCaution}</dt>
        <dd className="resource-caution">{site.caution}</dd>
      </dl>
      <p className="resource-pricing-detail">{site.pricingDetail}</p>
      {site.alternatives.length > 0 ? (
        <p className="resource-alternatives">
          <span>{t.resourceSimilar}</span> {site.alternatives.join(", ")}
        </p>
      ) : null}
      <a className="tool-link resource-visit" href={site.url} target="_blank" rel="noopener noreferrer">
        {t.resourceVisit}
      </a>
    </article>
  );
}

export function ResourceDirectory() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<ResourceGroup | undefined>(undefined);
  const [freeOnly, setFreeOnly] = useState(false);
  const [koreanOnly, setKoreanOnly] = useState(false);

  const filtered = useMemo(
    () => filterResources(resources, { query, group, freeOnly, koreanOnly }),
    [query, group, freeOnly, koreanOnly]
  );
  const grouped = useMemo(() => groupResources(filtered), [filtered]);

  return (
    <div className="section resources-workbench">
      <div className="card resources-filter-bar">
        <div className="search-form-group">
          <label className="search-form-label" htmlFor="resource-search">
            {t.resourceSearch}
          </label>
          <input
            id="resource-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.resourceSearchPlaceholder}
          />
        </div>
        <div className="chip-group" role="group" aria-label={t.resourceSearch}>
          <button type="button" className={`chip ${group === undefined ? "active" : ""}`} onClick={() => setGroup(undefined)}>
            {t.resourceAll} ({resources.length})
          </button>
          {RESOURCE_GROUPS.map((item, index) => {
            const count = resources.filter((site) => site.group === item).length;
            if (count === 0) return null;
            return (
              <button
                key={item}
                type="button"
                className={`chip ${group === item ? "active" : ""}`}
                onClick={() => setGroup(item)}
                aria-pressed={group === item}
              >
                {t.resourceGroups[index]} ({count})
              </button>
            );
          })}
        </div>
        <div className="resource-toggles">
          <label className="badge-option">
            <input type="checkbox" checked={freeOnly} onChange={() => setFreeOnly((value) => !value)} />
            <div className="badge-option-content">
              <span>{t.resourceFreeOnly}</span>
            </div>
          </label>
          <label className="badge-option">
            <input type="checkbox" checked={koreanOnly} onChange={() => setKoreanOnly((value) => !value)} />
            <div className="badge-option-content">
              <span>{t.resourceKoreanOnly}</span>
            </div>
          </label>
        </div>
        <p className="resource-result-count">
          <strong>{filtered.length}</strong>
          {t.resourceCount}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <strong>{t.resourceNoMatch}</strong>
        </div>
      ) : null}

      {grouped.map(({ group: sectionGroup, sites }) => {
        const index = RESOURCE_GROUPS.indexOf(sectionGroup);
        return (
          <section className="resource-section" key={sectionGroup}>
            <div className="journal-section-head">
              <span className="section-kicker">{String(index + 1).padStart(2, "0")}</span>
              <h2>{t.resourceGroups[index]}</h2>
              <p className="text-muted">{t.resourceGroupDescs[index]}</p>
            </div>
            <div className="grid grid-3 resource-grid">
              {sites.map((site) => (
                <ResourceCard key={site.name} site={site} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
