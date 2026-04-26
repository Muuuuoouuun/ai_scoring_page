"use client";

import { useMemo, useState } from "react";
import { communityPosts, type CommunityPost } from "@/lib/community";
import { genreMeta, getGenreLabel, toolGenres } from "@/lib/genres";
import type { ToolGenre } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

type SortMode = "hot" | "new" | "answered";

const sortPosts = (posts: CommunityPost[], sortMode: SortMode) => {
  if (sortMode === "new") return [...posts].sort((a, b) => a.age.localeCompare(b.age));
  if (sortMode === "answered") return posts.filter((post) => post.status === "answered");
  return [...posts].sort((a, b) => b.votes + b.comments * 2 - (a.votes + a.comments * 2));
};

export default function CommunityPage() {
  const { lang } = useLanguage();
  const [selectedGenre, setSelectedGenre] = useState<ToolGenre | "all">("all");
  const [sortMode, setSortMode] = useState<SortMode>("hot");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [localPosts, setLocalPosts] = useState<CommunityPost[]>([]);
  const [voteDeltas, setVoteDeltas] = useState<Record<string, number>>({});

  const posts = useMemo(() => {
    const mergedPosts = [...localPosts, ...communityPosts];
    const filtered =
      selectedGenre === "all"
        ? mergedPosts
        : mergedPosts.filter((post) => post.genre === selectedGenre);
    return sortPosts(filtered, sortMode);
  }, [localPosts, selectedGenre, sortMode]);

  const totalOpinions = posts.reduce((sum, post) => sum + post.votes + post.comments, 0);
  const trendingPosts = [...posts]
    .sort((a, b) => b.votes + b.comments * 2 - (a.votes + a.comments * 2))
    .slice(0, 3);
  const topContributors = Array.from(new Map(posts.map((post) => [post.author, post])).values())
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 4);

  const submitPost = () => {
    if (!draftTitle.trim() || !draftBody.trim()) return;

    const genre = selectedGenre === "all" ? "saas" : selectedGenre;
    setLocalPosts((current) => [
      {
        id: `local-${Date.now()}`,
        title: draftTitle.trim(),
        body: draftBody.trim(),
        author: "@you",
        genre,
        votes: 1,
        comments: 0,
        age: lang === "ko" ? "방금" : "now",
        flair: lang === "ko" ? "질문" : "Question",
        status: "new"
      },
      ...current
    ]);
    setDraftTitle("");
    setDraftBody("");
  };
  const votePost = (postId: string, delta: 1 | -1) => {
    setVoteDeltas((current) => ({
      ...current,
      [postId]: (current[postId] ?? 0) + delta
    }));
  };

  return (
    <main className="community-page">
      <header className="community-hero">
        <div>
          <span className="section-kicker">REDDIT-STYLE COMMUNITY</span>
          <h1>{lang === "ko" ? "투표로 올라오는 현장 토론" : "Field threads ranked by votes"}</h1>
          <p className="text-muted">
            {lang === "ko"
              ? "큐레이션 블로그와 분리된 사용자 질문, 비교 요청, 실무 경험 피드입니다."
              : "A separate feed for user questions, comparison requests, and field experience."}
          </p>
        </div>
        <div className="community-signal-board" aria-label={lang === "ko" ? "커뮤니티 신호 요약" : "Community signal summary"}>
          <div>
            <strong>{posts.length}</strong>
            <span>{lang === "ko" ? "활성 글" : "active posts"}</span>
          </div>
          <div>
            <strong>{toolGenres.length}</strong>
            <span>{lang === "ko" ? "장르" : "genres"}</span>
          </div>
          <div>
            <strong>{totalOpinions}</strong>
            <span>{lang === "ko" ? "의견 신호" : "opinion signals"}</span>
          </div>
        </div>
      </header>

      <section className="community-workbench">
        <aside className="community-sidebar" aria-label={lang === "ko" ? "커뮤니티 필터" : "Community filters"}>
          <div className="card">
            <span className="section-kicker">GENRES</span>
            <div className="genre-filter-stack">
              <button
                aria-pressed={selectedGenre === "all"}
                className={selectedGenre === "all" ? "active" : ""}
                onClick={() => setSelectedGenre("all")}
                type="button"
              >
                <strong>{lang === "ko" ? "전체" : "All"}</strong>
                <small>{lang === "ko" ? "모든 토론 보기" : "All discussions"}</small>
              </button>
              {toolGenres.map((genre) => (
                <button
                  aria-pressed={selectedGenre === genre}
                  className={selectedGenre === genre ? "active" : ""}
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  type="button"
                >
                  <strong>{getGenreLabel(genre, lang)}</strong>
                  <small>{genreMeta[genre].summary[lang]}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <span className="section-kicker">SORT</span>
            <div className="segmented-control" role="group" aria-label={lang === "ko" ? "정렬" : "Sort"}>
              {(["hot", "new", "answered"] as const).map((mode) => (
                <button
                  aria-pressed={sortMode === mode}
                  className={sortMode === mode ? "active" : ""}
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  type="button"
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="card community-trending-card">
            <span className="section-kicker">TRENDING SIGNALS</span>
            {trendingPosts.map((post) => (
              <a href={`#${post.id}`} key={post.id}>
                <strong>{post.title}</strong>
                <small>{post.votes + post.comments * 2} signal heat</small>
              </a>
            ))}
            <button className="secondary-button" type="button">
              {lang === "ko" ? "신호 맵 보기" : "View signal map"}
            </button>
          </div>

          <div className="card community-contributors-card">
            <span className="section-kicker">TOP CONTRIBUTORS</span>
            {topContributors.map((post) => (
              <div key={post.author}>
                <span>{post.author}</span>
                <strong>{post.votes}</strong>
              </div>
            ))}
          </div>
        </aside>

        <section className="community-main-feed">
          <div className="community-feed-toolbar card">
            <div>
              <span className="section-kicker">LIVE THREADS</span>
              <strong>{posts.length} {lang === "ko" ? "개의 토론" : "threads"}</strong>
            </div>
            <div className="community-mode-pills" aria-label={lang === "ko" ? "커뮤니티 피드 상태" : "Community feed status"}>
              <span>{sortMode}</span>
              <span>{selectedGenre === "all" ? "all" : getGenreLabel(selectedGenre, lang)}</span>
              <span>{lang === "ko" ? "블로그 분리" : "blog separated"}</span>
            </div>
          </div>

          <div className="community-composer card">
            <span className="section-kicker">COMMUNITY POST</span>
            <input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder={lang === "ko" ? "무엇을 비교하거나 묻고 싶나요?" : "What do you want to compare or ask?"}
            />
            <textarea
              value={draftBody}
              onChange={(event) => setDraftBody(event.target.value)}
              placeholder={lang === "ko" ? "상황, 현재 쓰는 도구, 막힌 지점을 적어주세요." : "Share the situation, current tool, and where you are stuck."}
              rows={4}
            />
            <button className="button" disabled={!draftTitle.trim() || !draftBody.trim()} onClick={submitPost} type="button">
              {lang === "ko" ? "글 올리기" : "Post"}
            </button>
          </div>

          <div className="reddit-feed">
            {posts.map((post) => {
              const displayVotes = post.votes + (voteDeltas[post.id] ?? 0);

              return (
                <article className="reddit-post-card" id={post.id} key={post.id}>
                  <div className="vote-rail" aria-label={lang === "ko" ? "추천 점수" : "Vote score"}>
                    <button aria-label={lang === "ko" ? "추천" : "Upvote"} onClick={() => votePost(post.id, 1)} type="button">+</button>
                    <strong>{displayVotes}</strong>
                    <button aria-label={lang === "ko" ? "비추천" : "Downvote"} onClick={() => votePost(post.id, -1)} type="button">-</button>
                  </div>
                  <div className="thread-main">
                    <div className="thread-meta">
                      <span>{getGenreLabel(post.genre, lang)}</span>
                      <span>{post.author}</span>
                      <span>{post.age}</span>
                      <span>{post.comments} {lang === "ko" ? "댓글" : "comments"}</span>
                    </div>
                    <h2>{post.title}</h2>
                    <p>{post.body}</p>
                    <div className="thread-tag-row">
                      <span>{post.flair}</span>
                      <span>{post.status}</span>
                      {post.toolName ? <span>{post.toolName}</span> : null}
                    </div>
                    <div className="thread-action-row">
                      <button type="button">{post.comments} {lang === "ko" ? "댓글" : "comments"}</button>
                      <button type="button">{lang === "ko" ? "공유" : "Share"}</button>
                      <button type="button">{lang === "ko" ? "저장" : "Save"}</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
