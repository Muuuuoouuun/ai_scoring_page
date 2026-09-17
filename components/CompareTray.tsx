"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools } from "@/data/tools";
import { compareHref } from "@/lib/compare";
import { useCompareTray } from "@/components/useCompareTray";
import { useLanguage } from "@/components/LanguageProvider";
import { ProductLogo } from "@/components/ProductLogo";

export function CompareTray() {
  const { t } = useLanguage();
  const { ids, remove, clear, max } = useCompareTray();
  const pathname = usePathname();
  const selected = ids
    .map((id) => tools.find((tool) => tool.id === id))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  if (selected.length === 0 || pathname === "/compare") {
    return null;
  }

  return (
    <div className="compare-tray" role="region" aria-label={t.compareTrayTitle}>
      <strong>
        {t.compareTrayTitle} {selected.length}/{max}
      </strong>
      <ul className="compare-tray-list">
        {selected.map((tool) => (
          <li key={tool.id}>
            <ProductLogo name={tool.name} size="sm" />
            <span>{tool.name}</span>
            <button type="button" onClick={() => remove(tool.id)} aria-label={`${tool.name} ${t.compareRemove}`}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="compare-tray-actions">
        <Link className="button" href={compareHref(ids)}>
          {t.compareGo}
        </Link>
        <button className="secondary-button" type="button" onClick={clear}>
          {t.compareClear}
        </button>
      </div>
    </div>
  );
}
