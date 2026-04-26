"use client";

import type { Tool } from "@/lib/types";
import { getToolCommunityPosts } from "@/lib/community";
import { getGenreLabel } from "@/lib/genres";
import { useLanguage } from "@/components/LanguageProvider";

export function CommunityContent({ tool }: { tool: Tool }) {
  const { lang } = useLanguage();
  const posts = getToolCommunityPosts(tool);

  return (
    <section className="section tool-community-panel">
      <div className="section-head">
        <span className="section-kicker">FIELD COMMUNITY</span>
        <h2>{lang === "ko" ? "비슷한 고민의 현장 글" : "Related field posts"}</h2>
        <p className="text-muted">
          {lang === "ko"
            ? `${tool.name}와 같은 장르의 도입 경험, 실패 사례, 비교 요청을 모았습니다.`
            : `Posts from teams comparing, adopting, or replacing tools like ${tool.name}.`}
        </p>
      </div>
      <div className="reddit-feed">
        {posts.map((post) => (
          <article className="reddit-post-card" key={post.id}>
            <div className="vote-rail" aria-label={lang === "ko" ? "추천 점수" : "Vote score"}>
              <button aria-label={lang === "ko" ? "추천" : "Upvote"} type="button">+</button>
              <strong>{post.votes}</strong>
              <button aria-label={lang === "ko" ? "비추천" : "Downvote"} type="button">-</button>
            </div>
            <div className="thread-main">
              <div className="thread-meta">
                <span>{getGenreLabel(post.genre, lang)}</span>
                <span>{post.author}</span>
                <span>{post.age}</span>
                <span>{post.comments} {lang === "ko" ? "댓글" : "comments"}</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <div className="thread-tag-row">
                <span>{post.flair}</span>
                <span>{post.status}</span>
                {post.toolName ? <span>{post.toolName}</span> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
