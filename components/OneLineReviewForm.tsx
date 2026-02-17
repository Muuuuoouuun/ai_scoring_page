"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type ReviewItem = {
  id: string;
  nickname: string;
  line: string;
  detail: string;
  rating: number;
  createdAt: string;
};

const storageKey = (toolId: string) => `g2-reviews-${toolId}`;

const parseReviewList = (raw: string | null): ReviewItem[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ReviewItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && item.id && item.line);
  } catch {
    return [];
  }
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
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setReviews(parseReviewList(localStorage.getItem(storageKey(toolId))));
  }, [toolId]);

  const onSave = () => {
    if (!line.trim()) return;
    const item: ReviewItem = {
      id: crypto.randomUUID(),
      nickname: nickname.trim() || t.anonymous,
      line: line.trim(),
      detail: detail.trim(),
      rating,
      createdAt: new Date().toISOString()
    };
    const next = [item, ...reviews].slice(0, 30);
    localStorage.setItem(storageKey(toolId), JSON.stringify(next));
    setReviews(next);
    setNickname("");
    setLine("");
    setDetail("");
    setRating(4);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <section className="card review-form-card">
      <strong>{t.reviewWrite}</strong>
      <label>
        {t.nickname}
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          maxLength={24}
          placeholder={t.nicknamePlaceholder}
        />
      </label>
      <label>
        {t.oneLine}
        <input
          value={line}
          onChange={(event) => setLine(event.target.value)}
          maxLength={120}
          placeholder={t.oneLinePlaceholder}
        />
      </label>
      <label>
        {t.detail}
        <textarea
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          rows={4}
          placeholder={t.detailPlaceholder}
        />
      </label>
      <label>
        {t.rating}
        <div className="rating-row" role="radiogroup" aria-label="리뷰 평점">
          {[1, 2, 3, 4, 5].map((point) => (
            <button
              key={point}
              type="button"
              className={`rating-star ${rating >= point ? "active" : ""}`}
              onClick={() => setRating(point)}
              aria-label={`${point}점`}
              aria-pressed={rating === point}
            >
              ★
            </button>
          ))}
          <span>{rating}.0 / 5</span>
        </div>
      </label>
      <button className="secondary-button" type="button" onClick={onSave}>
        {saved ? t.saved : t.saveReview}
      </button>
      <div className="review-list">
        <strong>
          {t.reviewList} ({reviews.length})
        </strong>
        {reviews.length === 0 ? <p>{t.firstReview}</p> : null}
        {reviews.map((review) => (
          <article key={review.id} className="review-item">
            <div className="review-item-head">
              <strong>{review.nickname}</strong>
              <span>{review.rating}.0</span>
            </div>
            <p>{review.line}</p>
            {review.detail ? <small>{review.detail}</small> : null}
            <time dateTime={review.createdAt}>{formatDate(review.createdAt, lang === "ko" ? "ko-KR" : "en-US")}</time>
          </article>
        ))}
      </div>
    </section>
  );
}
