"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { getRankedTags, getTagLabel, countToolsForTag } from "@/lib/problems";

/**
 * 홈과 검색이 같은 태그 목록을 씁니다.
 * 이전에는 홈이 i18n에 하드코딩된 문장 6개를, 검색이 도구 배열 앞쪽에서 뽑은 8개를 보여줘서
 * 두 화면의 목록이 서로 달랐고, 30개 문제 중 22개는 어디서도 클릭할 수 없었습니다.
 */
export function ProblemCategoryList() {
  const { lang, t } = useLanguage();
  const tags = getRankedTags();

  return (
    <section className="section problem-journal-section">
      <div className="journal-section-head">
        <span className="section-kicker">SITUATION COMPASS</span>
        <h2>{t.problemTitle}</h2>
        <p className="text-muted">{t.problemDesc}</p>
      </div>
      <div className="situation-list">
        {tags.map((tag) => {
          const count = countToolsForTag(tag.id);
          return (
            <Link className="situation-row" href={`/search?tag=${tag.id}`} key={tag.id}>
              <span className="situation-copy">
                <strong>{getTagLabel(tag, lang)}</strong>
                <small>{tag.description}</small>
              </span>
              <span className="situation-count">
                {count}
                <em>{lang === "ko" ? "개 후보" : "options"}</em>
              </span>
              <span className="situation-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
