"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import type { Review } from "@/lib/types";

const formatDate = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));

export function OneLineReviewForm({ toolId }: { toolId: string }) {
  const [nickname, setNickname] = useState("");
  const [line, setLine] = useState("");
  const [detail, setDetail] = useState("");
  const [rating, setRating] = useState(4);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const initialized = useRef(false);

  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews/${toolId}`);
      if (res.ok) setReviews(await res.json());
    } catch {
      // fallback: no reviews
    }
  }, [toolId]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadReviews();
    }
  }, [loadReviews]);

  const onSave = async () => {
    if (!line.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/reviews/${toolId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line, detail, rating, nickname })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "오류가 발생했습니다.");
        return;
      }
      const newReview: Review = await res.json();
      setReviews((prev) => [newReview, ...prev]);
      setNickname("");
      setLine("");
      setDetail("");
      setRating(4);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card review-form-card">
      <strong>{t.reviewWrite}</strong>

      <div className="form-field">
        <span className="form-field-label">{t.nickname}</span>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={24}
          placeholder={t.nicknamePlaceholder}
        />
      </div>

      <div className="form-field">
        <span className="form-field-label">{t.oneLine}</span>
        <input
          value={line}
          onChange={(e) => setLine(e.target.value)}
          maxLength={120}
          placeholder={t.oneLinePlaceholder}
        />
      </div>

      <div className="form-field">
        <span className="form-field-label">{t.detail}</span>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={4}
          placeholder={t.detailPlaceholder}
        />
      </div>

      <div className="form-field">
        <span className="form-field-label">{t.rating}</span>
        <div
          className="rating-row"
          role="radiogroup"
          aria-label="리뷰 평점"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((point) => (
            <button
              key={point}
              type="button"
              className={`rating-star ${(hoverRating || rating) >= point ? "active" : ""}`}
              onClick={() => setRating(point)}
              onMouseEnter={() => setHoverRating(point)}
              aria-label={`${point}점`}
              aria-pressed={rating === point}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </button>
          ))}
          <span className="rating-score-display">{hoverRating || rating}.0</span>
        </div>
      </div>

      {error && <p style={{ color: "var(--accent)", fontSize: "0.875rem" }}>{error}</p>}

      <button
        className="button"
        type="button"
        onClick={onSave}
        disabled={loading || !line.trim()}
        style={{ marginTop: "0.5rem", width: "fit-content" }}
      >
        {saved ? (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {t.saved}
          </>
        ) : loading ? (
          "저장 중..."
        ) : (
          t.saveReview
        )}
      </button>

      <div className="review-list">
        <strong style={{ marginTop: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
          {t.reviewList}{" "}
          <span style={{ color: "var(--muted)", fontWeight: 400 }}>({reviews.length})</span>
        </strong>
        {reviews.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>{t.firstReview}</p>
        ) : null}

        {reviews.map((review) => (
          <article key={review.id} className="review-item">
            <div className="review-item-head">
              <strong>
                {review.nickname}
                <span className="review-item-rating">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  {review.rating}.0
                </span>
              </strong>
              <time dateTime={review.createdAt}>
                {formatDate(review.createdAt, lang === "ko" ? "ko-KR" : "en-US")}
              </time>
            </div>
            <p>{review.line}</p>
            {review.detail ? <small>{review.detail}</small> : null}
          </article>
        ))}
      </div>
    </details>
  );
}
