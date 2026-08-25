"use client";

import type { ReviewMeta } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

/**
 * 이 리뷰를 믿을 근거.
 *
 * 앞 화면들이 전부 단정입니다. 단정을 늘릴수록 "이 사람이 실제로 써보긴 했나"라는
 * 질문이 커지고, 근거가 없으면 정보를 늘린 만큼 신뢰가 깎입니다.
 *
 * reviewedBy가 비어 있으면 아직 검수 전이라는 뜻입니다. 그 사실을 숨기지 않고 그대로 알립니다.
 */
export function ReviewProvenance({ meta }: { meta: ReviewMeta }) {
  const { t } = useLanguage();
  const verified = Boolean(meta.reviewedBy);

  return (
    <section className={`provenance ${verified ? "is-verified" : "is-draft"}`}>
      <div className="provenance-main">
        <span className="provenance-label">{t.reviewMetaTitle}</span>
        {verified ? (
          <p>
            <strong>
              {t.reviewedBy} {meta.reviewedBy}
            </strong>
            {meta.reviewedAt ? <span className="provenance-date"> · {meta.reviewedAt}</span> : null}
          </p>
        ) : (
          <p className="provenance-draft-note">{t.reviewUnverified}</p>
        )}
        {meta.usageContext ? <p className="provenance-context">{meta.usageContext}</p> : null}
      </div>
      <ul className="evidence-list">
        {meta.evidence.map((item) => (
          <li key={`${item.kind}-${item.note}`} className={`evidence evidence-${item.kind}`}>
            <span className="evidence-kind">{t.evidenceKinds[item.kind]}</span>
            <span className="evidence-note">{item.note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
