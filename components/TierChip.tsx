"use client";

import { TIER_ORDER, type ScoreTierKey } from "@/lib/scoring";
import { useLanguage } from "@/components/LanguageProvider";

export function TierChip({ tier, size = "md" }: { tier: ScoreTierKey; size?: "sm" | "md" }) {
  const { t } = useLanguage();
  return <span className={`tier-chip tier-${tier} tier-chip-${size}`}>{t.tierLabels[TIER_ORDER.indexOf(tier)]}</span>;
}
