"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { tools } from "@/data/tools";
import type { Tool } from "@/lib/types";
import Link from "next/link";

const IMPACT_LABELS: Record<string, string[]> = {
  ko: ["판단 속도", "사고 깊이", "실행 밀도", "협업 명확성"],
  en: ["Judgment Speed", "Thinking Depth", "Execution Density", "Collaboration Clarity"]
};

const IMPACT_KEYS: (keyof Tool["impact"])[] = ["judgmentSpeed", "thinkingDepth", "executionDensity", "collaborationClarity"];

const BADGE_LABELS: Record<string, Record<string, string>> = {
  ko: { timeSaver: "시간 절약", thinkCarefully: "신중한 사용", lockinRisk: "락인 위험" },
  en: { timeSaver: "Time Saver", thinkCarefully: "Think Carefully", lockinRisk: "Lock-in Risk" }
};

const ScoreBar = ({ value, max = 10 }: { value: number; max?: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
    <div style={{ flex: 1, height: "6px", background: "rgba(0,0,0,0.08)", borderRadius: "3px", overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${(value / max) * 100}%`,
          background: value >= 7 ? "var(--accent)" : value >= 5 ? "#f59e0b" : "#ef4444",
          borderRadius: "3px",
          transition: "width 0.4s ease"
        }}
      />
    </div>
    <strong style={{ minWidth: "1.5rem", textAlign: "right", fontSize: "0.9rem" }}>{value}</strong>
  </div>
);

export default function ComparePage() {
  const { lang } = useLanguage();
  const [selected, setSelected] = useState<string[]>([]);

  const impactLabels = IMPACT_LABELS[lang];
  const badgeLabels = BADGE_LABELS[lang];

  const toggleTool = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const selectedTools = tools.filter((t) => selected.includes(t.id));

  return (
    <main>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          {lang === "ko" ? "툴 비교 매트릭스" : "Tool Comparison Matrix"}
        </h1>
        <p style={{ color: "var(--muted)" }}>
          {lang === "ko"
            ? "최대 3개의 툴을 선택해 임팩트 점수를 나란히 비교해보세요."
            : "Select up to 3 tools to compare their impact scores side by side."}
        </p>
      </div>

      {/* 툴 선택 */}
      <section className="card" style={{ marginBottom: "2rem" }}>
        <strong style={{ display: "block", marginBottom: "1rem" }}>
          {lang === "ko"
            ? `비교할 툴 선택 (${selected.length}/3)`
            : `Select tools to compare (${selected.length}/3)`}
        </strong>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => toggleTool(tool.id)}
              className={`problem-chip ${selected.includes(tool.id) ? "active" : ""}`}
              disabled={!selected.includes(tool.id) && selected.length >= 3}
              style={{ opacity: !selected.includes(tool.id) && selected.length >= 3 ? 0.4 : 1 }}
            >
              {selected.includes(tool.id) && "✓ "}
              {tool.name}
            </button>
          ))}
        </div>
      </section>

      {/* 비교 결과 */}
      {selectedTools.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📊</p>
          <p style={{ color: "var(--muted)" }}>
            {lang === "ko" ? "위에서 툴을 선택해 비교를 시작하세요." : "Select tools above to start comparing."}
          </p>
        </div>
      ) : (
        <div>
          {/* 헤더 */}
          <div className="compare-grid" style={{ gridTemplateColumns: `200px repeat(${selectedTools.length}, 1fr)` }}>
            <div className="compare-header-cell">
              {lang === "ko" ? "항목" : "Metric"}
            </div>
            {selectedTools.map((tool) => (
              <div key={tool.id} className="compare-header-cell compare-tool-header">
                <Link href={`/tools/${tool.id}`} style={{ color: "var(--accent)", fontWeight: 700 }}>
                  {tool.name}
                </Link>
                <button
                  onClick={() => toggleTool(tool.id)}
                  style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "var(--muted)", cursor: "pointer", background: "none", border: "none" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* 임팩트 점수 */}
          <div className="compare-section-label">{lang === "ko" ? "임팩트 점수" : "Impact Scores"}</div>
          {IMPACT_KEYS.map((key, idx) => (
            <div key={key} className="compare-grid compare-row" style={{ gridTemplateColumns: `200px repeat(${selectedTools.length}, 1fr)` }}>
              <div className="compare-label">{impactLabels[idx]}</div>
              {selectedTools.map((tool) => (
                <div key={tool.id} className="compare-cell">
                  <ScoreBar value={tool.impact[key]} />
                </div>
              ))}
            </div>
          ))}

          {/* 판단 배지 */}
          <div className="compare-section-label">{lang === "ko" ? "판단 배지" : "Verdict Badges"}</div>
          {(["timeSaver", "thinkCarefully", "lockinRisk"] as const).map((badge) => (
            <div key={badge} className="compare-grid compare-row" style={{ gridTemplateColumns: `200px repeat(${selectedTools.length}, 1fr)` }}>
              <div className="compare-label">{badgeLabels[badge]}</div>
              {selectedTools.map((tool) => (
                <div key={tool.id} className="compare-cell" style={{ textAlign: "center" }}>
                  {tool.verdictBadges[badge] ? (
                    <span style={{ color: badge === "lockinRisk" ? "#ef4444" : badge === "thinkCarefully" ? "#f59e0b" : "#059669", fontWeight: 700 }}>✓</span>
                  ) : (
                    <span style={{ color: "var(--muted)" }}>—</span>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* 최선/최악 시나리오 */}
          <div className="compare-section-label">{lang === "ko" ? "최선 시나리오" : "Best Case"}</div>
          <div className="compare-grid compare-row" style={{ gridTemplateColumns: `200px repeat(${selectedTools.length}, 1fr)`, alignItems: "start" }}>
            <div className="compare-label" />
            {selectedTools.map((tool) => (
              <div key={tool.id} className="compare-cell" style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--muted)" }}>
                {tool.bestCase}
              </div>
            ))}
          </div>

          <div className="compare-section-label">{lang === "ko" ? "최악 시나리오" : "Worst Case"}</div>
          <div className="compare-grid compare-row" style={{ gridTemplateColumns: `200px repeat(${selectedTools.length}, 1fr)`, alignItems: "start" }}>
            <div className="compare-label" />
            {selectedTools.map((tool) => (
              <div key={tool.id} className="compare-cell" style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--muted)" }}>
                {tool.worstCase}
              </div>
            ))}
          </div>

          {/* 대안 툴 */}
          <div className="compare-section-label">{lang === "ko" ? "대안 툴" : "Alternatives"}</div>
          <div className="compare-grid compare-row" style={{ gridTemplateColumns: `200px repeat(${selectedTools.length}, 1fr)`, alignItems: "start" }}>
            <div className="compare-label" />
            {selectedTools.map((tool) => (
              <div key={tool.id} className="compare-cell">
                <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem", color: "var(--muted)", lineHeight: 2 }}>
                  {tool.alternatives.map((alt) => <li key={alt}>{alt}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {/* 상세 리뷰 링크 */}
          <div className="compare-grid compare-row" style={{ gridTemplateColumns: `200px repeat(${selectedTools.length}, 1fr)`, marginTop: "1rem" }}>
            <div />
            {selectedTools.map((tool) => (
              <div key={tool.id} className="compare-cell">
                <Link href={`/tools/${tool.id}`} className="button" style={{ width: "100%", justifyContent: "center", textAlign: "center" }}>
                  {lang === "ko" ? "상세 리뷰 →" : "Full Review →"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
