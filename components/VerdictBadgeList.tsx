"use client";

import type { VerdictBadges } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

export function VerdictBadgeList({ badges }: { badges: VerdictBadges }) {
  const { t } = useLanguage();
  const badgeLabels: Record<keyof VerdictBadges, string> = {
    timeSaver: t.verdict[0],
    thinkCarefully: t.verdict[1],
    lockinRisk: t.verdict[2]
  };

  return (
    <div className="badge-list" aria-label="판단 배지">
      {Object.entries(badges).map(([key, value]) =>
        value ? (
          <span className={`badge ${key}`} key={key}>
            {badgeLabels[key as keyof VerdictBadges]}
          </span>
        ) : null
      )}
    </div>
  );
}
