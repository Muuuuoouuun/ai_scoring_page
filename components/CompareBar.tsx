"use client";

import Link from "next/link";
import { useCompare, MAX_COMPARE } from "@/components/CompareProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { ProductLogo } from "@/components/ProductLogo";
import { getToolById } from "@/lib/tools";

/** 담은 도구를 화면 하단에 고정해서, 비교로 넘어가는 길을 항상 보이게 합니다. */
export function CompareBar() {
  const { selected, remove, clear } = useCompare();
  const { lang, t } = useLanguage();

  if (selected.length === 0) return null;

  const tools = selected.map((id) => getToolById(id)).filter(Boolean);
  const canCompare = selected.length >= 2;

  return (
    <div className="compare-bar" role="region" aria-label={t.compareTrayAria}>
      <div className="compare-bar-inner">
        <div className="compare-bar-items">
          <span className="compare-bar-label">
            {t.compareSelected} <strong>{selected.length}</strong>/{MAX_COMPARE}
          </span>
          <ul>
            {tools.map((tool) => (
              <li key={tool!.id}>
                <ProductLogo name={tool!.name} size="sm" />
                <span>{tool!.name}</span>
                <button
                  type="button"
                  onClick={() => remove(tool!.id)}
                  aria-label={`${tool!.name} ${lang === "ko" ? "빼기" : "remove"}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="compare-bar-actions">
          <button className="secondary-button" type="button" onClick={clear}>
            {t.compareClear}
          </button>
          {canCompare ? (
            <Link className="button" href={`/compare?tools=${selected.join(",")}`}>
              {t.compareGo}
            </Link>
          ) : (
            <span className="compare-bar-hint">{t.compareNeedTwo}</span>
          )}
        </div>
      </div>
    </div>
  );
}
