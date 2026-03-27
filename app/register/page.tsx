"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nickname, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "회원가입에 실패했습니다.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: "420px", margin: "4rem auto", padding: "0 1.5rem" }}>
      <div className="card" style={{ padding: "2.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>회원가입</h1>
        <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
          g2 커뮤니티에 가입해 리뷰와 토론에 참여하세요.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-field">
            <span className="form-field-label">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-field">
            <span className="form-field-label">닉네임</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: PM_anna"
              maxLength={24}
              required
            />
          </div>
          <div className="form-field">
            <span className="form-field-label">비밀번호 (최소 6자)</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p style={{ color: "#dc2626", fontSize: "0.875rem", margin: 0 }}>{error}</p>
          )}

          <button className="button" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--muted)" }}>
          이미 계정이 있으신가요?{" "}
          <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
            로그인
          </Link>
        </div>
      </div>
    </main>
  );
}
