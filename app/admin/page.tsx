"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Review } from "@/lib/types";
import type { PublicUser } from "@/lib/auth";

type Tool = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
};

type Tab = "tools" | "reviews" | "users";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("tools");
  const [tools, setTools] = useState<Tool[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [deleteMsg, setDeleteMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        if (!data || data.role !== "admin") {
          router.push("/login");
        }
        setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    if (tab === "tools") {
      fetch("/api/admin/tools").then((r) => r.json()).then(setTools);
    } else if (tab === "reviews") {
      fetch("/api/admin/reviews").then((r) => r.json()).then(setReviews);
    } else if (tab === "users") {
      fetch("/api/community/rank").then((r) => r.json()).then(setUsers);
    }
  }, [tab, user]);

  const handleDeleteReview = async (id: string) => {
    if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;
    const res = await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setDeleteMsg("리뷰가 삭제되었습니다.");
      setTimeout(() => setDeleteMsg(""), 2000);
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (!confirm("이 툴을 삭제하시겠습니까? (기본 툴은 삭제되지 않습니다)")) return;
    const res = await fetch("/api/admin/tools", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      setTools((prev) => prev.filter((t) => t.id !== id));
    }
  };

  if (loading) {
    return <main style={{ padding: "4rem 1.5rem", textAlign: "center" }}><p>로딩 중...</p></main>;
  }

  if (!user || user.role !== "admin") return null;

  return (
    <main>
      <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>어드민 대시보드</h1>
          <p style={{ color: "var(--muted)" }}>@{user.nickname} 님으로 로그인됨</p>
        </div>
        <Link href="/" className="secondary-button">← 메인으로</Link>
      </div>

      {deleteMsg && (
        <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "rgba(37,99,235,0.1)", borderRadius: "8px", color: "var(--accent)" }}>
          {deleteMsg}
        </div>
      )}

      {/* 탭 */}
      <div className="tabs-nav" style={{ marginBottom: "2rem" }}>
        {(["tools", "reviews", "users"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "tools" ? "툴 관리" : t === "reviews" ? "리뷰 관리" : "유저 현황"}
          </button>
        ))}
      </div>

      {/* 툴 목록 */}
      {tab === "tools" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0 }}>툴 목록 ({tools.length})</h2>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>툴명</th>
                  <th>설명</th>
                  <th>등록일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr key={tool.id}>
                    <td><strong>{tool.name}</strong></td>
                    <td style={{ color: "var(--muted)", fontSize: "0.875rem" }}>{tool.description?.slice(0, 60)}...</td>
                    <td style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{formatDate(tool.createdAt)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Link href={`/tools/${tool.id}`} className="secondary-button" style={{ fontSize: "0.8rem" }}>보기</Link>
                        <button className="danger-button" onClick={() => handleDeleteTool(tool.id)} style={{ fontSize: "0.8rem" }}>삭제</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 리뷰 목록 */}
      {tab === "reviews" && (
        <div>
          <h2 style={{ marginBottom: "1.5rem" }}>리뷰 목록 ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "var(--muted)" }}>등록된 리뷰가 없습니다.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>닉네임</th>
                    <th>한줄 리뷰</th>
                    <th>평점</th>
                    <th>툴 ID</th>
                    <th>작성일</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td><strong>{review.nickname}</strong></td>
                      <td style={{ fontSize: "0.875rem" }}>{review.line}</td>
                      <td>{"★".repeat(review.rating)}</td>
                      <td style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{review.toolId.slice(0, 8)}...</td>
                      <td style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{formatDate(review.createdAt)}</td>
                      <td>
                        <button className="danger-button" onClick={() => handleDeleteReview(review.id)} style={{ fontSize: "0.8rem" }}>
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 유저 현황 */}
      {tab === "users" && (
        <div>
          <h2 style={{ marginBottom: "1.5rem" }}>활동 유저 랭킹</h2>
          {users.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "var(--muted)" }}>아직 리뷰를 작성한 유저가 없습니다.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>닉네임</th>
                    <th>이메일</th>
                    <th>역할</th>
                    <th>리뷰 수</th>
                    <th>포인트</th>
                    <th>가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id}>
                      <td><strong>#{i + 1}</strong></td>
                      <td><strong>{u.nickname}</strong></td>
                      <td style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{u.email}</td>
                      <td>
                        <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: u.role === "admin" ? "rgba(37,99,235,0.1)" : "rgba(0,0,0,0.05)" }}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.reviewCount ?? 0}</td>
                      <td>{u.points ?? 0}P</td>
                      <td style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
