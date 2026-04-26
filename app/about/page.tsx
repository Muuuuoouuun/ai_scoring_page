"use client";

import { useState, MouseEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

function InteractiveSignal() {
  const [signals, setSignals] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    // Throttle slightly by only adding signals occasionally, or just taking the event
    if (Math.random() > 0.8) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newSignal = { x, y, id: Date.now() + Math.random() };

      setSignals((prev) => [...prev.slice(-15), newSignal]);
    }
  };

  return (
    <div className="glass-interactive" onMouseMove={handleMouseMove}>
      {/* Render signal rings */}
      {signals.map((sig) => (
        <div
          key={sig.id}
          style={{
            position: "absolute",
            left: sig.x - 20,
            top: sig.y - 20,
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1px solid rgba(176, 138, 82, 0.4)",
            animation: "pulseNode 2s ease-out forwards",
            pointerEvents: "none",
          }}
        />
      ))}
      <div className="content">
        <h2>Move your cursor. Leave a signal.</h2>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem" }}>
          커뮤니티의 작은 신호들이 모여, 더 좋은 네트워크를 만듭니다.
        </p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"Beginner" | "Builder" | "Curator">("Beginner");

  const tabContent = {
    Beginner: {
      title: "“무엇부터 봐야 할지” 길을 만든다",
      desc: "입문 로드맵 + 핵심 용어 정리 + 추천 시작 스택 제공"
    },
    Builder: {
      title: "바로 적용 가능한 비교와 레시피",
      desc: "대안 비교, 워크플로우 구성, 아키텍처 선택을 확신 있게"
    },
    Curator: {
      title: "도구 제보와 리뷰로 기여",
      desc: "커뮤니티와 모더레이터가 함께 큐레이션 품질을 높입니다"
    }
  };

  return (
    <main className="about-page">
      {/* 1) Hero */}
      <section className="glass-panel-hero">
        <h1>Intelligence, curated and structured.</h1>
        <p className="subtitle">
          AI/에이전트/자동화 도구는 많아졌는데, 좋은 정보는 흩어져 있고 기준은 모호합니다.<br />
          우리는 빌더와 초보자 모두가 빠르게 이해하고 선택할 수 있도록 도구와 지식을 구조화합니다.
        </p>
        <div className="hero-actions">
          <Link href="/search" className="button">
            Explore the Hub
          </Link>
          <a href="#" className="secondary-button" style={{ background: "rgba(255,255,255,0.8)" }}>
            Join the Community
          </a>
        </div>
        <small style={{ color: "var(--muted)", fontWeight: 600 }}>“No hype. Just clarity.”</small>
      </section>

      {/* 2) Why */}
      <section>
        <div className="about-section-header">
          <h2>왜 이런 허브가 필요한가</h2>
          <p>정보가 넘치는 시대, 판단을 위한 진짜 신호가 부족합니다.</p>
        </div>
        <div className="grid grid-3">
          <div className="glass-card">
            <h3>방대한 링크, 부족한 맥락</h3>
            <p>AI 정보와 도구는 매일 쏟아지지만 정작 내 상황에 맞는지 판단할 기준이 부족합니다.</p>
          </div>
          <div className="glass-card">
            <h3>선택 피로도</h3>
            <p>직접 써보지 않으면 알 수 없는 파편화된 특징들 때문에 탐색에 너무 많은 에너지가 소모됩니다.</p>
          </div>
          <div className="glass-card" style={{ background: "rgba(176, 138, 82, 0.08)", borderColor: "rgba(176, 138, 82, 0.24)" }}>
            <h3 style={{ color: "var(--accent)" }}>검색이 아닌 결정</h3>
            <p>그래서 우리는 단순한 정보 나열이 아니라, "의사결정"이 가능한 형태로 지식을 구조화합니다.</p>
          </div>
        </div>
      </section>

      {/* 3) What we do */}
      <section>
        <div className="about-section-header">
          <h2>우리가 제공하는 4가지</h2>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="glass-card pencil-underline">
            <h3>Curated Tools</h3>
            <p>가장 검증되고 실사용 가치가 높은 에이전트/AI 도구를 목적별로 엄선하여 큐레이션합니다.</p>
          </div>
          <div className="glass-card pencil-underline">
            <h3>Structured Breakdowns</h3>
            <p>기능, 확실한 대안, 비용, 적합한 유저 등 복잡한 요소를 한 페이지에서 구조적으로 파악합니다.</p>
          </div>
          <div className="glass-card pencil-underline">
            <h3>Build-ready Guides</h3>
            <p>단순 소개를 넘어 실제 워크플로우 적용 패턴, 자동화 템플릿, 연동 레시피를 제공합니다.</p>
          </div>
          <div className="glass-card pencil-underline">
            <h3>Community Signals</h3>
            <p>실제 사용자들의 생생한 평가, 한 줄 리뷰, 사용 사례를 통해 도구의 진짜 가치를 판단합니다.</p>
          </div>
        </div>
      </section>

      {/* 4) For whom */}
      <section>
        <div className="about-section-header">
          <h2>초보자도, 빌더도</h2>
        </div>
        <div className="glass-tabs" role="tablist" aria-label={lang === "ko" ? "대상별 허브 경로" : "Audience paths"}>
          {(["Beginner", "Builder", "Curator"] as const).map((tab) => (
            <button
              aria-controls={`${tab.toLowerCase()}-panel`}
              aria-selected={activeTab === tab}
              key={tab}
              className={`glass-tab ${activeTab === tab ? "active" : ""}`}
              id={`${tab.toLowerCase()}-tab`}
              onClick={() => setActiveTab(tab)}
              role="tab"
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
        <div
          aria-labelledby={`${activeTab.toLowerCase()}-tab`}
          className="glass-card"
          id={`${activeTab.toLowerCase()}-panel`}
          role="tabpanel"
          style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}
        >
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{tabContent[activeTab].title}</h3>
          <p style={{ fontSize: "1.1rem" }}>{tabContent[activeTab].desc}</p>
        </div>
      </section>

      {/* 5) Curation Principles */}
      <section>
        <div className="about-section-header">
          <h2>우리는 어떤 기준으로 고른다</h2>
          <p>광고형 나열이 아니라, 확신 있는 선택을 위한 5가지 원칙</p>
        </div>
        <div className="principle-list">
          <div className="principle-item">
            <strong style={{ width: "120px", color: "var(--accent)" }}>Clarity</strong>
            <span>어떤 문제를 해결하는지 한 문장으로 명확히 설명 가능해야 함</span>
          </div>
          <div className="principle-item">
            <strong style={{ width: "120px", color: "var(--accent)" }}>Utility</strong>
            <span>실제로 작업 시간을 줄이거나 결과물의 품질을 확연히 올려야 함</span>
          </div>
          <div className="principle-item">
            <strong style={{ width: "120px", color: "var(--accent)" }}>Proof</strong>
            <span>설명뿐 아니라 실제 사용 사례, 레퍼런스, 확실한 적용 맥락 존재</span>
          </div>
          <div className="principle-item">
            <strong style={{ width: "120px", color: "var(--accent)" }}>Alternatives</strong>
            <span>절대적인 1위는 없으므로 항상 선명한 대안 도구들과 함께 비교 검토</span>
          </div>
          <div className="principle-item">
            <strong style={{ width: "120px", color: "var(--accent)" }}>Freshness</strong>
            <span>지속적인 패치 노트 및 업데이트 상태, 현재 유지 관리 여부 확인</span>
          </div>
        </div>
      </section>

      {/* 6) Community Workflow */}
      <section>
        <div className="about-section-header">
          <h2>커뮤니티가 돌아가는 방식</h2>
          <p>기여는 가볍게, 결과물은 단단하게.</p>
        </div>
        <div className="timeline">
          <div className="timeline-step">
            <div className="circle">1</div>
            <strong>Submit</strong>
            <p style={{ fontSize: "0.95rem", color: "var(--muted)", margin: "0.5rem 0 0" }}>
              유용한 도구나 가이드를 커뮤니티에 가볍게 제보합니다.
            </p>
          </div>
          <div className="timeline-step">
            <div className="circle">2</div>
            <strong>Review</strong>
            <p style={{ fontSize: "0.95rem", color: "var(--muted)", margin: "0.5rem 0 0" }}>
              모더레이터와 커뮤니티가 요소들을 크로스 체크하고 피드백을 남깁니다.
            </p>
          </div>
          <div className="timeline-step">
            <div className="circle">3</div>
            <strong>Publish</strong>
            <p style={{ fontSize: "0.95rem", color: "var(--muted)", margin: "0.5rem 0 0" }}>
              명확한 허브 표준 템플릿에 맞춰 구조화된 정보로 정식 공개됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* 7) Interactive Section */}
      <section>
        <InteractiveSignal />
      </section>

      {/* 8) Roadmap */}
      <section>
        <div className="about-section-header">
          <h2>우리가 다음에 만드는 것</h2>
        </div>
        <div className="roadmap-grid">
          {[
            "Beginner Path v1 (입문 로드맵)",
            "Agent Workflow Gallery (레시피 라이브러리)",
            "Tool Comparison Matrix (비교표)",
            "Community Rank (시그널 기반 추천)"
          ].map((item, i) => (
            <div key={i} className="roadmap-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1 -5.93 -9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* 9) CTA Footer */}
      <section className="glass-panel-footer">
        <h2 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Build with clarity.</h2>
        <p style={{ color: "var(--muted)", fontSize: "1.2rem", marginBottom: "2rem" }}>
          탐색하거나, 기여하거나, 함께 구조화하세요.
        </p>
        <div className="hero-actions">
          <Link href="/search" className="button">
            Start Exploring
          </Link>
          <a href="#" className="secondary-button" style={{ background: "rgba(255,255,255,0.8)" }}>
            Submit a Tool
          </a>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <a href="#" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "underline" }}>
            Join Discord / Forum
          </a>
        </div>
      </section>

    </main>
  );
}
