"use client";

import { useEffect, useState, useCallback } from "react";
import type { Tool, Review } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";

const formatDate = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso));

export function CommunityContent({ tool }: { tool: Tool }) {
  const { lang, t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

    return (
        <div className="card empty-state-card">
            <h2>{t.tabCommunity}</h2>
            <p className="text-muted">
                {lang === "ko"
                  ? "아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!"
                  : "No reviews yet. Be the first!"}
              </p>
              <p style={{ marginTop: "0.5rem" }}>
                <button
                  className="button"
                  onClick={() => {
                    // Switch to review tab
                    const reviewTab = document.querySelector('[data-tab="review"]') as HTMLButtonElement;
                    reviewTab?.click();
                  }}
                >
                  {lang === "ko" ? "리뷰 작성하기" : "Write a review"}
                </button>
              </p>
            </div>
          ) : (
            <div className="community-feed">
              {reviews.map((review) => (
                <article key={review.id} className="review-snippet">
                  <div className="review-snippet-header">
                    <span className="user-nickname">@{review.nickname}</span>
                    <time style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                      {formatDate(review.createdAt, locale)}
                    </time>
                  </div>
                  <div className="review-snippet-tool">
                    <strong>{tool.name}</strong>
                    <span className="review-item-rating" style={{ marginLeft: "0.5rem" }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      {review.rating}.0
                    </span>
                  </div>
                  <p className="review-snippet-text">{review.line}</p>
                  {review.detail && (
                    <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                      {review.detail}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
