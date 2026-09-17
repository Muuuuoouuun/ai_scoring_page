"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";
import type { PublicUser } from "@/lib/auth";

const BADGES = [
  { min: 1, label: "첫 발걸음", color: "#6B7280" },
  { min: 3, label: "리뷰어", color: "#059669" },
  { min: 10, label: "전문가", color: "#2563EB" },
  { min: 30, label: "마스터", color: "#7C3AED" }
];

const getBadge = (reviewCount: number) => {
  let badge = BADGES[0];
  for (const b of BADGES) {
    if (reviewCount >= b.min) badge = b;
  }
  return badge;
};

const RANK_ICONS = ["🥇", "🥈", "🥉"];

export default function CommunityRankPage() {
  const { lang } = useLanguage();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/community/rank")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  return (
    <main>
      <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>
            {lang === "ko" ? "🏆 커뮤니티 랭크" : "🏆 Community Rank"}
          </h1>
          <p style={{ color: "var(--muted)" }}>
            {lang === "ko"
              ? "리뷰를 작성할수록 포인트가 쌓이고 랭크가 올라갑니다."
              : "Earn points by writing reviews and climb the ranks."}
          </p>
        </div>
        <Link href="/community" className="secondary-button">← {lang === "ko" ? "커뮤니티" : "Community"}</Link>
      </div>

      {/* 포인트 안내 */}
      <div className="card" style={{ marginBottom: "2rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div>
          <strong style={{ display: "block", marginBottom: "0.5rem" }}>
            {lang === "ko" ? "포인트 적립 방법" : "How to earn points"}
          </strong>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 2 }}>
            <li>{lang === "ko" ? "리뷰 작성: +10P" : "Write a review: +10P"}</li>
          </ul>
        </div>
        <div>
          <strong style={{ display: "block", marginBottom: "0.5rem" }}>
            {lang === "ko" ? "등급 체계" : "Badge system"}
          </strong>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {BADGES.map((b) => (
              <span key={b.label} style={{ fontSize: "0.8rem", padding: "0.2rem 0.6rem", borderRadius: "100px", border: `1px solid ${b.color}`, color: b.color }}>
                {b.label} ({b.min}+ {lang === "ko" ? "리뷰" : "reviews"})
              </span>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)" }}>
          {lang === "ko" ? "불러오는 중..." : "Loading..."}
        </div>
      ) : users.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌱</p>
          <p style={{ color: "var(--muted)" }}>
            {lang === "ko"
              ? "아직 랭킹에 오른 멤버가 없습니다. 첫 리뷰를 남겨보세요!"
              : "No ranked members yet. Write the first review!"}
          </p>
          <Link href="/search" className="button" style={{ marginTop: "1rem", display: "inline-block" }}>
            {lang === "ko" ? "툴 찾아보기" : "Browse tools"}
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {users.map((user, i) => {
            const badge = getBadge(user.reviewCount ?? 0);
            return (
              <div key={user.id} className="card rank-row">
                <div className="rank-position">
                  {i < 3 ? (
                    <span style={{ fontSize: "1.75rem" }}>{RANK_ICONS[i]}</span>
                  ) : (
                    <span style={{ fontWeight: 800, color: "var(--muted)", fontSize: "1.1rem" }}>#{i + 1}</span>
                  )}
                </div>
                <div className="rank-user-info">
                  <strong style={{ fontSize: "1.05rem" }}>@{user.nickname}</strong>
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      fontSize: "0.75rem",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "100px",
                      border: `1px solid ${badge.color}`,
                      color: badge.color
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
                <div className="rank-stats">
                  <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                    {lang === "ko" ? "리뷰" : "Reviews"} <strong>{user.reviewCount ?? 0}</strong>
                  </span>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                    {user.points ?? 0}P
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
