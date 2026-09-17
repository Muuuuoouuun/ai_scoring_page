"use client";

import type { Tool } from "@/lib/types";
import { getToolDiscussions } from "@/lib/community";
import { useLanguage } from "@/components/LanguageProvider";

export function DiscussionContent({ tool }: { tool: Tool }) {
  const { lang } = useLanguage();
  const discussions = getToolDiscussions(tool);

  return (
    <section className="section discussion-board">
      <div className="section-head">
        <span className="section-kicker">ADOPTION DEBATE</span>
        <h2>{lang === "ko" ? "도입 판단 토론" : "Adoption debates"}</h2>
        <p className="text-muted">
          {lang === "ko"
            ? "찬반보다 중요한 것은 이 도구가 어느 상황에서 좋은 판단을 만들고, 어디서 비용을 숨기는지입니다."
            : "The useful question is where this tool improves judgment, and where it hides cost."}
        </p>
      </div>
      <div className="discussion-thread-list">
        {discussions.map((discussion) => (
          <article className="reddit-thread-card" key={discussion.id}>
            <div className="vote-rail" aria-label={lang === "ko" ? "추천 점수" : "Vote score"}>
              <button aria-label={lang === "ko" ? "추천" : "Upvote"} type="button">+</button>
              <strong>{discussion.votes}</strong>
              <button aria-label={lang === "ko" ? "비추천" : "Downvote"} type="button">-</button>
            </div>
            <div className="thread-main">
              <div className="thread-meta">
                <span className={`stance-pill ${discussion.stance}`}>{discussion.stance}</span>
                <span>{discussion.comments} {lang === "ko" ? "댓글" : "comments"}</span>
              </div>
              <h3>{discussion.title}</h3>
              <p>{discussion.summary}</p>
              <div className="thread-tag-row">
                {discussion.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
