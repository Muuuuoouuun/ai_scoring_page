"use client";

import { useCompareTray } from "@/components/useCompareTray";
import { useLanguage } from "@/components/LanguageProvider";

export function CompareToggleButton({ toolId }: { toolId: string }) {
  const { t } = useLanguage();
  const { ids, toggle, isFull } = useCompareTray();
  const active = ids.includes(toolId);
  const disabled = !active && isFull;

  return (
    <button
      type="button"
      className={`compare-toggle ${active ? "active" : ""}`}
      onClick={() => toggle(toolId)}
      disabled={disabled}
      title={disabled ? t.compareFull : undefined}
      aria-pressed={active}
    >
      {active ? `✓ ${t.compareAdded}` : `+ ${t.compareAdd}`}
    </button>
  );
}
