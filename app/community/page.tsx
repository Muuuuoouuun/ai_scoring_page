"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { buildOpenQuestions, type OpenQuestion } from "@/lib/community/questions";

/**
 * 커뮤니티 홈.
 *
 * 이전 버전에는 지어낸 활동 지표(최근 리뷰 3 · 토론 신호 4 · 의견 합계 144)와
 * 가상의 사용자(@PM_anna 등)가 실제 데이터인 것처럼 들어가 있었습니다.
 * 그 뒤에는 정직한 "준비 중" 상태로 바꿨지만, 그건 죽은 화면이었습니다.
 *
 * 이제 활동 피드 대신 "열린 질문 보드"입니다.
 * 활동 0건은 죽어 보이지만 답이 없는 질문 목록은 0건이어도 정상이고,
 * 질문은 전부 실제 편집 콘텐츠(에디터 점수와 근거, 빈 변경 이력, 최악 시나리오)에서 나옵니다.
 */
const KIND_ORDER: OpenQuestion["kind"][] = ["low-score", "no-history", "worst-case"];

export default function CommunityPage() {
  const { lang, t } = useLanguage();
  const [kind, setKind] = useState<OpenQuestion["kind"] | "all">("all");

  const questions = useMemo(() => buildOpenQuestions(lang), [lang]);
  const shown = kind === "all" ? questions : questions.filter((q) => q.kind === kind);

  const kindLabel: Record<OpenQuestion["kind"], string> = {
    "low-score": t.qKindLowScore,
    "no-history": t.qKindNoHistory,
    "worst-case": t.qKindWorstCase
  };

  return (
    <main className="community-page">
      <header className="community-hero">
        <div>
          <span className="section-kicker">OPEN QUESTIONS</span>
          <h1>{t.communityHeadline}</h1>
          <p className="text-muted">{t.communitySubline}</p>
        </div>
      </header>

      <section className="section">
        <div className="questions-toolbar">
          <div className="segmented" role="group" aria-label={t.qFilterAria}>
            <button
              type="button"
              className={kind === "all" ? "active" : ""}
              onClick={() => setKind("all")}
            >
              {t.qAll} {questions.length}
            </button>
            {KIND_ORDER.map((option) => (
              <button
                type="button"
                key={option}
                className={kind === option ? "active" : ""}
                onClick={() => setKind(option)}
              >
                {kindLabel[option]}
              </button>
            ))}
          </div>
          <p className="field-hint">{t.qFirstPerk}</p>
        </div>

        <ul className="question-board">
          {shown.map((question) => (
            <li key={question.id} className={`question-card q-${question.kind}`}>
              <div className="question-card-head">
                <span className="question-kind">{kindLabel[question.kind]}</span>
                {/* 응답 0을 그대로 적습니다. 숨기거나 다른 지표로 위장하지 않습니다. */}
                <span className="question-answers">{t.qNoAnswers}</span>
              </div>
              <h2>{question.question}</h2>
              <p className="question-basis">
                <span className="cell-sublabel">{t.qOurTake}</span> {question.weDontKnow}
              </p>
              <Link className="tool-link" href={question.href}>
                {t.qAnswerCta}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
