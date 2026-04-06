"use client";

import type { FeatureChecklist, FeatureStatus } from "@/lib/insights";
import { useLanguage } from "@/components/LanguageProvider";

const STATUS_ICON: Record<FeatureStatus, string> = {
  supported: "✓",
  partial: "~",
  unsupported: "✕"
};

const STATUS_CLASS: Record<FeatureStatus, string> = {
  supported: "feature-supported",
  partial: "feature-partial",
  unsupported: "feature-unsupported"
};

function FeatureRow({ item }: { item: { name: string; status: FeatureStatus; note?: string } }) {
  return (
    <li className={`feature-row ${STATUS_CLASS[item.status]}`}>
      <span className="feature-icon">{STATUS_ICON[item.status]}</span>
      <span className="feature-name">{item.name}</span>
      {item.note ? <span className="feature-note">{item.note}</span> : null}
    </li>
  );
}

export function FeatureChecklistSection({ checklist }: { checklist: FeatureChecklist }) {
  const { t } = useLanguage();

  return (
    <section className="card feature-checklist-card">
      <strong>{t.featureChecklistTitle}</strong>
      <div className="feature-checklist-grid">
        <div className="feature-col">
          <h4 className="feature-col-title feature-col-title--good">{t.coreFeaturesLabel}</h4>
          <ul className="feature-list">
            {checklist.coreFeatures.map((item) => (
              <FeatureRow key={item.name} item={item} />
            ))}
          </ul>
        </div>
        <div className="feature-col">
          <h4 className="feature-col-title feature-col-title--bad">{t.limitationsLabel}</h4>
          <ul className="feature-list">
            {checklist.limitations.map((item) => (
              <FeatureRow key={item.name} item={item} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
