"use client";

import { useState, useRef } from "react";
import type { ReviewItem } from "@/lib/reviews";
import { useToolReviews } from "@/components/useToolReviews";
import { useLanguage } from "@/components/LanguageProvider";
import type { UserReview } from "@/lib/types";

const formatDate = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));

const TRUST_WEIGHT: Record<string, number> = {
  "1년 이상": 3,
  "6개월-1년": 2,
  "1-6개월": 1,
  "1개월 미만": 0
};

function TrustBadge({ review }: { review: UserReview }) {
  const weight =
    review.usagePeriod != null ? (TRUST_WEIGHT[review.usagePeriod] ?? 0) : 0;
  if (!review.role && !review.teamSize && !review.usagePeriod) return null;
  return (
    <div className="review-trust-meta">
      {review.role ? <span className="trust-chip">{review.role}</span> : null}
      {review.teamSize ? <span className="trust-chip">{review.teamSize}</span> : null}
      {review.usagePeriod ? (
        <span className={`trust-chip trust-chip--period trust-weight-${weight}`}>
          {review.usagePeriod}
        </span>
      ) : null}
    </div>
  );
}

export function OneLineReviewForm({ toolId }: { toolId: string }) {
  const [nickname, setNickname] = useState("");
  const [line, setLine] = useState("");
  const [detail, setDetail] = useState("");
  const [rating, setRating] = useState(4);
  const [hoverRating, setHoverRating] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { reviews, add } = useToolReviews(toolId);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  }, [loadReviews]);

  const onSave = async () => {
    if (!line.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId,
          nickname: nickname.trim() || t.anonymous,
          line: line.trim(),
          detail: detail.trim() || undefined,
          rating,
          role: role.trim() || undefined,
          teamSize: teamSize || undefined,
          usagePeriod: usagePeriod || undefined
        })
      });
      if (!res.ok) return;
      const { review } = await res.json();
      setReviews((prev) => [review, ...prev].slice(0, 30));
      setNickname("");
      setLine("");
      setDetail("");
      setRating(4);
      setRole("");
      setTeamSize("");
      setUsagePeriod("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const onSave = async () => {
    if (!line.trim()) return;
    const item: ReviewItem = {
      id: crypto.randomUUID(),
      nickname: nickname.trim() || t.anonymous,
      line: line.trim(),
      detail: detail.trim(),
      rating,
      imageUrl: imagePreview || undefined, // Store temporary object URL
      createdAt: new Date().toISOString()
    };
    add(item);
    
    // Reset Form
    setNickname("");
    setLine("");
    setDetail("");
    setRating(4);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="card review-form-card" id="review-form">
      <strong>{t.reviewWrite}</strong>
      {error ? <p className="form-status error">{error}</p> : null}
      
      <label className="form-field">
        <span className="form-field-label">{t.nickname}</span>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={24}
          placeholder={t.nicknamePlaceholder}
        />
      </label>

      <label className="form-field">
        <span className="form-field-label">{t.oneLine}</span>
        <input
          value={line}
          onChange={(e) => setLine(e.target.value)}
          maxLength={120}
          placeholder={t.oneLinePlaceholder}
        />
      </label>

      <label className="form-field">
        <span className="form-field-label">{t.detail}</span>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={4}
          placeholder={t.detailPlaceholder}
        />
      </label>

      {/* 신뢰도 메타 필드 */}
      <div className="form-row-3">
        <div className="form-field">
          <span className="form-field-label">{t.reviewRole}</span>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            maxLength={50}
            placeholder={t.reviewRolePlaceholder}
          />
        </div>
        <div className="form-field">
          <span className="form-field-label">{t.reviewTeamSize}</span>
          <select value={teamSize} onChange={(e) => setTeamSize(e.target.value)}>
            <option value="">{t.filterAll}</option>
            {teamSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <span className="form-field-label">{t.reviewUsagePeriod}</span>
          <select value={usagePeriod} onChange={(e) => setUsagePeriod(e.target.value)}>
            <option value="">{t.filterAll}</option>
            {usagePeriodOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-field">
        <span className="form-field-label">{t.attachmentOptional}</span>
        <div className="image-upload-wrapper">
          <label className="image-upload-label">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
              ref={fileInputRef}
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            {t.uploadScreenshot}
          </label>
          {imagePreview && (
            <div className="image-preview-area">
              <div className="image-preview-box">
                <img src={imagePreview} alt="Preview" />
              </div>
            </div>
          )}
        </div>
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

      <button className="button review-submit-button" type="button" onClick={onSave} disabled={saving}>
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
          saving ? t.reviewSaving : t.saveReview
        )}
      </button>

      <div className="review-list">
        <strong className="review-list-title">
          {t.reviewList} <span>({reviews.length})</span>
        </strong>
        {loading ? <p className="text-muted">{t.reviewLoading}</p> : null}
        {!loading && reviews.length === 0 ? <p className="text-muted">{t.firstReview}</p> : null}
        
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
            <TrustBadge review={review} />
            <p>{review.line}</p>
            {review.detail ? <small>{review.detail}</small> : null}
            {review.imageUrl && (
              <div className="review-item-images">
                <img src={review.imageUrl} alt="Review attachment" />
              </div>
            )}
          </article>
        ))}
      </div>
    </details>
  );
}
