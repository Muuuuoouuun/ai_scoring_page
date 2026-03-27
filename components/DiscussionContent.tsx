"use client";

import { useEffect, useState, useCallback } from "react";
import type { Tool, Discussion } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

const formatDate = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export function DiscussionContent({ tool }: { tool: Tool }) {
  const { t, lang } = useLanguage();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyNickname, setReplyNickname] = useState("");
  const [error, setError] = useState("");

  const loadDiscussions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/discussions/${tool.id}`);
      if (res.ok) setDiscussions(await res.json());
    } finally {
      setLoading(false);
    }
  }, [tool.id]);

  useEffect(() => {
    loadDiscussions();
  }, [loadDiscussions]);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/discussions/${tool.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, nickname })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "오류 발생");
        return;
      }
      const newDiscussion: Discussion = await res.json();
      setDiscussions((prev) => [newDiscussion, ...prev]);
      setTitle("");
      setContent("");
      setNickname("");
    } catch {
      setError("네트워크 오류");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (discussionId: string) => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/discussions/${tool.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyTo: discussionId, replyContent, nickname: replyNickname })
      });
      if (res.ok) {
        await loadDiscussions();
        setReplyingTo(null);
        setReplyContent("");
        setReplyNickname("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const locale = lang === "ko" ? "ko-KR" : "en-US";

  return (
    <div className="tab-content">
      {/* 새 토론 작성 */}
      <section className="card" style={{ marginBottom: "1.5rem" }}>
        <strong style={{ display: "block", marginBottom: "1rem" }}>
          {lang === "ko" ? "새 토론 시작" : "Start a Discussion"}
        </strong>
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
          <span className="form-field-label">{lang === "ko" ? "제목" : "Title"}</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder={lang === "ko" ? "토론 주제를 입력하세요" : "Enter discussion topic"}
          />
        </div>
        <div className="form-field">
          <span className="form-field-label">{lang === "ko" ? "내용" : "Content"}</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder={lang === "ko" ? "생각을 자유롭게 나눠보세요." : "Share your thoughts freely."}
          />
        </div>
        {error && <p style={{ color: "red", fontSize: "0.875rem" }}>{error}</p>}
        <button
          className="button"
          type="button"
          onClick={handlePost}
          disabled={submitting || !title.trim() || !content.trim()}
          style={{ marginTop: "0.5rem" }}
        >
          {lang === "ko" ? "토론 올리기" : "Post Discussion"}
        </button>
      </section>

      {/* 토론 목록 */}
      {loading ? (
        <p style={{ color: "var(--muted)" }}>{lang === "ko" ? "불러오는 중..." : "Loading..."}</p>
      ) : discussions.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "var(--muted)" }}>
            {lang === "ko"
              ? "아직 토론이 없습니다. 첫 번째 토론을 시작해보세요!"
              : "No discussions yet. Start the first one!"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {discussions.map((d) => (
            <article key={d.id} className="card discussion-thread">
              <div className="review-item-head">
                <strong>{d.nickname}</strong>
                <time style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                  {formatDate(d.createdAt, locale)}
                </time>
              </div>
              <h3 style={{ margin: "0.5rem 0", fontSize: "1rem" }}>{d.title}</h3>
              <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.9rem" }}>{d.content}</p>

              {/* 답변들 */}
              {d.replies.length > 0 && (
                <div className="discussion-replies">
                  {d.replies.map((r) => (
                    <div key={r.id} className="discussion-reply">
                      <strong style={{ fontSize: "0.85rem" }}>{r.nickname}</strong>
                      <time style={{ color: "var(--muted)", fontSize: "0.75rem", marginLeft: "0.5rem" }}>
                        {formatDate(r.createdAt, locale)}
                      </time>
                      <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem" }}>{r.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 답변 작성 */}
              <div style={{ marginTop: "0.75rem" }}>
                {replyingTo === d.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <input
                      value={replyNickname}
                      onChange={(e) => setReplyNickname(e.target.value)}
                      placeholder={t.nicknamePlaceholder}
                      maxLength={24}
                    />
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                      placeholder={lang === "ko" ? "답변을 입력하세요" : "Write your reply"}
                    />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="button" type="button" onClick={() => handleReply(d.id)} disabled={submitting}>
                        {lang === "ko" ? "답변 등록" : "Post Reply"}
                      </button>
                      <button className="secondary-button" type="button" onClick={() => setReplyingTo(null)}>
                        {lang === "ko" ? "취소" : "Cancel"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => { setReplyingTo(d.id); setReplyContent(""); }}
                    style={{ fontSize: "0.8rem" }}
                  >
                    {lang === "ko"
                      ? `답변 ${d.replies.length > 0 ? `(${d.replies.length})` : ""}`
                      : `Reply ${d.replies.length > 0 ? `(${d.replies.length})` : ""}`}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
