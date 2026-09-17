"use client";

import { useEffect, useState, useCallback } from "react";
import type { Tool, Discussion } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

const formatDate = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

    return (
        <div className="card empty-state-card">
            <h2>{t.tabDiscussion}</h2>
            <p className="text-muted">
                {lang === "ko"
                    ? "이 도구의 장단점에 대해 자유롭게 토론해보세요. (준비 중)"
                    : "Discuss the pros and cons of this tool freely. (Coming soon)"}
            </p>
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
