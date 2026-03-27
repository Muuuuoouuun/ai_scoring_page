"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";
import type { Review, Discussion } from "@/lib/types";
import { tools } from "@/data/tools";

const formatRelative = (iso: string, locale: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (locale === "ko-KR") {
    if (mins < 1) return "방금 전";
    if (mins < 60) return `${mins}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  }
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export default function CommunityPage() {
  const { t, lang } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  const locale = lang === "ko" ? "ko-KR" : "en-US";

  const getToolName = (toolId: string) =>
    tools.find((t) => t.id === toolId)?.name ?? toolId.slice(0, 8);

  useEffect(() => {
    Promise.all([
      fetch("/api/reviews").then((r) => r.json()),
      fetch("/api/discussions").then((r) => r.json())
    ]).then(([r, d]) => {
      setReviews(r);
      setDiscussions(d);
      setLoading(false);
    });
  }, []);

  return (
    <main className="community-page">
      <header className="section-head text-center" style={{ marginTop: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{t.communityHeadline}</h1>
        <p className="text-muted" style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
          {t.communitySubline}
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.5rem" }}>
          <Link href="/community/rank" className="secondary-button">
            {lang === "ko" ? "🏆 커뮤니티 랭크" : "🏆 Community Rank"}
          </Link>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)" }}>
          {lang === "ko" ? "불러오는 중..." : "Loading..."}
        </div>
      ) : (
        <div className="community-grid">
          {/* 최신 리뷰 */}
          <section className="community-column">
            <h2 style={{ marginBottom: "1.5rem" }}>{t.latestReviews}</h2>
            <div className="community-feed">
              {reviews.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                  <p style={{ color: "var(--muted)" }}>
                    {lang === "ko" ? "아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!" : "No reviews yet!"}
                  </p>
                </div>
              ) : (
                reviews.slice(0, 8).map((review) => (
                  <article key={review.id} className="review-snippet">
                    <div className="review-snippet-header">
                      <span className="user-nickname">@{review.nickname}</span>
                      <time>{formatRelative(review.createdAt, locale)}</time>
                    </div>
                    <div className="review-snippet-tool">
                      <Link href={`/tools/${review.toolId}`}>
                        <strong>{getToolName(review.toolId)}</strong>
                      </Link>
                      <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem", color: "var(--muted)" }}>
                        {"★".repeat(review.rating)}
                      </span>
                    </div>
                    <p className="review-snippet-text">{review.line}</p>
                  </article>
                ))
              )}
            </div>
          </section>

          {/* 인기 토론 */}
          <section className="community-column">
            <h2 style={{ marginBottom: "1.5rem" }}>{t.popularDiscussions}</h2>
            <div className="community-feed">
              {discussions.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                  <p style={{ color: "var(--muted)" }}>
                    {lang === "ko"
                      ? "아직 토론이 없습니다. 툴 페이지에서 토론을 시작해보세요!"
                      : "No discussions yet. Start one on a tool page!"}
                  </p>
                </div>
              ) : (
                discussions.slice(0, 6).map((d) => (
                  <article key={d.id} className="discussion-item">
                    <Link href={`/tools/${d.toolId}#discussion`} style={{ textDecoration: "none" }}>
                      <h3 className="discussion-title">{d.title}</h3>
                    </Link>
                    <p className="discussion-meta">
                      <strong>{getToolName(d.toolId)}</strong>
                      {" · "}
                      {lang === "ko"
                        ? `${d.replies.length}개의 답변 · @${d.nickname}`
                        : `${d.replies.length} replies · @${d.nickname}`}
                      {" · "}
                      {formatRelative(d.createdAt, locale)}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
