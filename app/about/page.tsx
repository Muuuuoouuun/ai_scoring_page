"use client";

import Link from "next/link";
import { brand } from "@/lib/brand";
import { copy as t } from "@/lib/copy";
import { MIN_SAMPLE } from "@/lib/community/consensus";
import { MIN_DISSENT_REASON } from "@/lib/community/types";

/**
 * 평가 기준.
 *
 * 이전 /about은 "입문 로드맵", "추천 시작 스택", Beginner/Builder/Curator 탭으로
 * 제품과 전혀 다른 세 번째 컨셉을 말하고 있었습니다.
 *
 * 리뷰 사이트에서 방문자가 실제로 알고 싶은 건 "당신들은 누구인가"가 아니라
 * "이 점수를 믿어도 되는가"입니다. 그래서 이 페이지는 규칙을 설명하는 페이지입니다.
 * 여기 적힌 규칙은 대부분 코드와 테스트로 강제되고 있고, 그 위치도 함께 밝힙니다.
 */
const rules = [
  {
    title: "점수에는 반드시 근거가 붙습니다",
    body: "왜 그 숫자인지 한 줄로 못 쓰겠으면 점수를 매기지 않습니다. 근거는 접어두지 않고 점수 옆에 그대로 노출합니다. 근거 없는 점수는 저장 단계에서 거부됩니다.",
    enforcedBy: "ScoreFacet 타입 · lib/validators.ts"
  },
  {
    title: "어떤 문장도 도구 간에 재사용하지 않습니다",
    body: "예전에는 10개 도구 중 8개의 총평이 이름만 바꾼 같은 문장이었고, 변경 이력은 10개가 전부 동일했습니다. 지금은 총평·비교·가이드·탈락 조건·가격 문장이 도구마다 다른지를 테스트가 검사합니다.",
    enforcedBy: "tests/review-integrity.test.ts"
  },
  {
    title: "확인하지 못한 것은 지어내지 않습니다",
    body: "변경 이력이 확인되지 않은 도구는 빈 채로 두고 화면에 \"확인된 변경 이력 없음\"으로 표시합니다. 가격도 마찬가지로, 확인한 시점을 적을 수 없으면 \"확인 시점 미기재\"가 그대로 보입니다.",
    enforcedBy: "빈 배열 + 화면 표기 · 회귀 테스트"
  },
  {
    title: `표본이 ${MIN_SAMPLE}명 미만이면 평균을 만들지 않습니다`,
    body: "\"4.5점(2명)\"은 거짓말에 가깝습니다. 응답이 적을 때는 요약하는 대신 각자가 어떤 처지에서 무엇이라 답했는지를 그대로 나열합니다. 이건 화면 관례가 아니라 집계 함수와 DB 뷰 양쪽에 박아둔 규칙입니다.",
    enforcedBy: "lib/community/consensus.ts · db/community.sql"
  },
  {
    title: "점수는 반박할 수 있습니다",
    body: `각 항목에 동의·더 낮다·더 높다로 답할 수 있습니다. 다르게 보신다면 근거를 ${MIN_DISSENT_REASON}자 이상 적어야 합니다 — 저희 자신에게 요구한 규칙과 같은 것을 적용합니다.`,
    enforcedBy: "MIN_DISSENT_REASON · API·저장소·DB 세 계층 공유"
  },
  {
    title: "리뷰는 시간이 지나면 썩습니다",
    body: "도입 결정 기록을 남기신 분께 3개월 뒤 \"지금도 쓰시나요\"를 다시 여쭙니다. 6개월 넘게 확인되지 않은 기록은 그렇게 표시하고 집계에서 뺍니다. 그래서 시간이 지나면 축소하거나 그만둔 사례도 함께 보입니다.",
    enforcedBy: "decision_records.checked_at"
  }
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <header className="about-hero">
        <span className="section-kicker">METHODOLOGY</span>
        <h1>{t.aboutTitle}</h1>
        <p className="about-lede">{brand.oneLiner}</p>
        <p className="text-muted">{t.aboutDesc}</p>
      </header>

      <section className="section">
        <div className="journal-section-head">
          <span className="section-kicker">HOW WE SCORE</span>
          <h2>{t.aboutDiffTitle}</h2>
          <p className="text-muted">
            아래는 지키겠다는 다짐이 아니라 코드와 테스트로 강제되고 있는 규칙입니다. 각 항목에
            어디서 강제되는지를 함께 적었습니다.
          </p>
        </div>

        <ol className="rule-list">
          {rules.map((rule) => (
            <li key={rule.title} className="rule-item">
              <h3>{rule.title}</h3>
              <p>{rule.body}</p>
              <span className="rule-enforced">
                <span className="cell-sublabel">강제되는 곳</span> {rule.enforcedBy}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <div className="card draft-notice">
          <span className="section-kicker">현재 상태</span>
          <h2>지금 리뷰는 검수 전 초안입니다</h2>
          <p>
            도구 10개의 리뷰 본문은 공개된 제품 문서를 근거로 정리한 초안이며, 실제 운영 경험이나
            요금표 확인 기록이 아직 없습니다. 모든 도구 화면 상단에 그 사실이 표시됩니다. 검수자
            이름이 채워지기 전까지는 도입 결정의 유일한 근거로 쓰지 마시고, 자사 환경에서 직접
            확인하시길 권합니다.
          </p>
          <Link className="button" href="/search">
            {t.heroCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
