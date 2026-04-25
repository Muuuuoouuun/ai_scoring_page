"use client";

import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import type { UserReview } from "@/lib/types";

type ReviewItem = UserReview & {
  imageUrl?: string;
};

const formatDate = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));

export function OneLineReviewForm({ toolId }: { toolId: string }) {
  const { lang, t } = useLanguage();
  const [nickname, setNickname] = useState("");
  const [line, setLine] = useState("");
  const [detail, setDetail] = useState("");
  const [rating, setRating] = useState(4);
  const [hoverRating, setHoverRating] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/tool/${toolId}/reviews`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load reviews");
        const data = (await response.json()) as { reviews: UserReview[] };
        if (!cancelled) setReviews(data.reviews);
      } catch {
        if (!cancelled) setError(t.reviewLoadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadReviews();
    return () => {
      cancelled = true;
    };
  }, [toolId, t.reviewLoadError]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local object URL to preview the image for now
      // Since there's no backend, we just store this local URL or a dummy path
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const onSave = async () => {
    if (!line.trim()) return;

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const response = await fetch(`/api/tool/${toolId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-nickname": nickname.trim() || t.anonymous
        },
        body: JSON.stringify({
          nickname,
          line,
          detail,
          rating
        })
      });

      if (!response.ok) throw new Error("Failed to save review");

      const data = (await response.json()) as { review: UserReview };
      setReviews((current) => [data.review, ...current].slice(0, 30));
      setNickname("");
      setLine("");
      setDetail("");
      setRating(4);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError(t.reviewSaveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card review-form-card">
      <strong>{t.reviewWrite}</strong>
      {error ? <p className="form-status error">{error}</p> : null}
      
      <div className="form-field">
        <span className="form-field-label">{t.nickname}</span>
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          maxLength={24}
          placeholder={t.nicknamePlaceholder}
        />
      </div>

      <div className="form-field">
        <span className="form-field-label">{t.oneLine}</span>
        <input
          value={line}
          onChange={(event) => setLine(event.target.value)}
          maxLength={120}
          placeholder={t.oneLinePlaceholder}
        />
      </div>

      <div className="form-field">
        <span className="form-field-label">{t.detail}</span>
        <textarea
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          rows={4}
          placeholder={t.detailPlaceholder}
        />
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
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {t.saved}
          </>
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
              <time dateTime={review.createdAt}>{formatDate(review.createdAt, lang === "ko" ? "ko-KR" : "en-US")}</time>
            </div>
            
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
    </section>
  );
}
