"use client";

import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";
import { tools } from "@/data/tools";

type PathStep = {
  step: number;
  problem: string;
  goal: string;
  tools: string[];
  why: string;
  tip: string;
};

const PATH: PathStep[] = [
  {
    step: 1,
    problem: "모든 게 흩어져 있다",
    goal: "중앙화된 작업 공간 만들기",
    tools: ["Notion", "Airtable"],
    why: "팀 작업이 여러 곳에 분산되면 맥락 단절이 생깁니다. 먼저 정보를 한곳으로 모으세요.",
    tip: "처음엔 규칙 없이 시작해도 됩니다. 단, 담당자와 마감일만은 반드시 기록하세요."
  },
  {
    step: 2,
    problem: "팀 커뮤니케이션이 어렵다",
    goal: "빠른 조율 채널 구축",
    tools: ["Slack"],
    why: "이메일은 비동기 논의에 강하지만 빠른 조율에는 약합니다. 실시간 채널이 필요합니다.",
    tip: "채널을 최소화하세요. 목적 없는 채널은 노이즈만 늘립니다. #general, #팀명, #긴급 3개면 충분합니다."
  },
  {
    step: 3,
    problem: "디자인 피드백이 느리다",
    goal: "협업 디자인 시스템 도입",
    tools: ["Figma", "Miro"],
    why: "결정을 미루는 주요 원인 중 하나는 공통된 시각적 기준이 없기 때문입니다.",
    tip: "Figma는 실행용, Miro는 발산 단계에 씁니다. 두 툴을 혼용하면 맥락이 분산됩니다."
  },
  {
    step: 4,
    problem: "반복 작업이 너무 많다",
    goal: "자동화로 생산성 레버리지",
    tools: ["Zapier"],
    why: "수작업 인수인계는 실수를 낳습니다. 판단 없이 반복되는 작업은 자동화의 첫 번째 후보입니다.",
    tip: "자동화하기 전에 '이 작업이 정말 필요한가'를 먼저 물어보세요. 불필요한 자동화는 복잡성만 늘립니다."
  },
  {
    step: 5,
    problem: "제품 실행이 산만하다",
    goal: "이슈 트래킹으로 실행 선명도 확보",
    tools: ["Linear"],
    why: "무엇이 중요한지 모르는 팀은 모든 것을 동시에 합니다. 선명한 우선순위가 실행력의 핵심입니다.",
    tip: "처음엔 1주 단위 사이클로 시작하세요. 계획보다 빠르게 닫힌 이슈가 실제 속도입니다."
  }
];

const VERDICT_COLORS: Record<string, string> = {
  timeSaver: "#059669",
  thinkCarefully: "#f59e0b",
  lockinRisk: "#ef4444"
};

export default function BeginnersPage() {
  const { lang } = useLanguage();

  return (
    <main>
      <div style={{ marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.25rem", marginBottom: "0.75rem" }}>
          {lang === "ko" ? "🌱 입문자 Path v1" : "🌱 Beginner Path v1"}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem", maxWidth: "640px" }}>
          {lang === "ko"
            ? "SaaS 툴을 처음 도입하는 팀을 위한 단계별 가이드입니다. 각 단계는 현실적인 문제에서 출발합니다."
            : "A step-by-step guide for teams adopting SaaS tools for the first time. Each step starts from a real problem."}
        </p>
      </div>

      {/* 진행 표시 */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
        {PATH.map((step) => (
          <div key={step.step} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--accent)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.875rem"
            }}>
              {step.step}
            </div>
            {step.step < PATH.length && (
              <div style={{ width: "2rem", height: "2px", background: "var(--border)" }} />
            )}
          </div>
        ))}
      </div>

      {/* 단계별 카드 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {PATH.map((step) => {
          const stepTools = tools.filter((t) => step.tools.includes(t.name));
          return (
            <div key={step.step} className="card beginner-path-card">
              <div className="beginner-path-header">
                <div className="beginner-step-badge">{lang === "ko" ? `단계 ${step.step}` : `Step ${step.step}`}</div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", margin: "0 0 0.25rem" }}>{step.goal}</h2>
                  <p style={{ color: "#ef4444", fontWeight: 600, margin: 0, fontSize: "0.875rem" }}>
                    {lang === "ko" ? `문제: ${step.problem}` : `Problem: ${step.problem}`}
                  </p>
                </div>
              </div>

              <p style={{ color: "var(--muted)", lineHeight: 1.7, margin: "1rem 0" }}>{step.why}</p>

              {/* 추천 툴 */}
              <div style={{ marginBottom: "1rem" }}>
                <strong style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.75rem" }}>
                  {lang === "ko" ? "추천 툴" : "Recommended tools"}
                </strong>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {stepTools.map((tool) => (
                    <Link key={tool.id} href={`/tools/${tool.id}`} className="card" style={{ padding: "1rem", minWidth: "200px", flex: 1 }}>
                      <strong style={{ display: "block", marginBottom: "0.25rem" }}>{tool.name}</strong>
                      <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0 0 0.5rem" }}>{tool.description}</p>
                      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                        {Object.entries(tool.verdictBadges)
                          .filter(([, val]) => val)
                          .map(([key]) => (
                            <span
                              key={key}
                              style={{
                                fontSize: "0.7rem",
                                padding: "0.15rem 0.4rem",
                                borderRadius: "100px",
                                border: `1px solid ${VERDICT_COLORS[key]}`,
                                color: VERDICT_COLORS[key]
                              }}
                            >
                              {key === "timeSaver" ? (lang === "ko" ? "시간 절약" : "Time Saver") :
                               key === "thinkCarefully" ? (lang === "ko" ? "신중한 사용" : "Think Carefully") :
                               (lang === "ko" ? "락인 위험" : "Lock-in Risk")}
                            </span>
                          ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 팁 */}
              <div style={{
                padding: "0.75rem 1rem",
                background: "rgba(37,99,235,0.06)",
                borderRadius: "8px",
                borderLeft: "3px solid var(--accent)"
              }}>
                <strong style={{ fontSize: "0.8rem", color: "var(--accent)", display: "block", marginBottom: "0.25rem" }}>
                  {lang === "ko" ? "💡 실무 팁" : "💡 Practical Tip"}
                </strong>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.6 }}>{step.tip}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 다음 단계 CTA */}
      <div className="card" style={{ marginTop: "2.5rem", textAlign: "center", padding: "2.5rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>
          {lang === "ko" ? "더 깊이 파고들 준비가 됐나요?" : "Ready to go deeper?"}
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          {lang === "ko"
            ? "상황별 문제 기반 검색으로 지금 팀에 맞는 툴을 찾아보세요."
            : "Search by your problem context to find the right tool for your team right now."}
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/search" className="button">{lang === "ko" ? "문제 기반으로 검색하기" : "Search by problem"}</Link>
          <Link href="/compare" className="secondary-button">{lang === "ko" ? "툴 비교하기" : "Compare tools"}</Link>
        </div>
      </div>
    </main>
  );
}
