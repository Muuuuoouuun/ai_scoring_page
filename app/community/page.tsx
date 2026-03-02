"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function CommunityPage() {
    const { t } = useLanguage();

    return (
        <main className="community-page">
            <header className="section-head text-center" style={{ marginTop: "2rem" }}>
                <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{t.communityHeadline}</h1>
                <p className="text-muted" style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
                    {t.communitySubline}
                </p>
            </header>

            <div className="community-grid">
                <section className="community-column">
                    <h2 style={{ marginBottom: "1.5rem" }}>{t.latestReviews}</h2>
                    <div className="community-feed">
                        {/* Mock Review 1 */}
                        <article className="review-snippet">
                            <div className="review-snippet-header">
                                <span className="user-nickname">@PM_anna</span>
                                <time>2시간 전</time>
                            </div>
                            <div className="review-snippet-tool">
                                <strong>Slack</strong>
                            </div>
                            <p className="review-snippet-text">
                                너무 많은 채널 때문에 인지 과부하가 옵니다. 핵심 논의 채널만 남기고 삭제했습니다. 협업 명확성이 크게 올라갔습니다.
                            </p>
                            <div className="badge-list" style={{ marginTop: "0.75rem" }}>
                                <span className="badge thinkCarefully">신중한 사용</span>
                            </div>
                        </article>

                        {/* Mock Review 2 */}
                        <article className="review-snippet">
                            <div className="review-snippet-header">
                                <span className="user-nickname">@Design_lead</span>
                                <time>5시간 전</time>
                            </div>
                            <div className="review-snippet-tool">
                                <strong>Figma</strong>
                            </div>
                            <p className="review-snippet-text">
                                디자인 피드백이 항상 최신화되어 빠른 커뮤니케이션이 가능합니다. 댓글 스레드 관리가 조금 어렵긴 하지만 필수 툴입니다.
                            </p>
                            <div className="badge-list" style={{ marginTop: "0.75rem" }}>
                                <span className="badge timeSaver">시간 절약</span>
                            </div>
                        </article>

                        {/* Mock Review 3 */}
                        <article className="review-snippet">
                            <div className="review-snippet-header">
                                <span className="user-nickname">@Dev_mark</span>
                                <time>어제</time>
                            </div>
                            <div className="review-snippet-tool">
                                <strong>Notion</strong>
                            </div>
                            <p className="review-snippet-text">
                                위키로선 좋지만 작업 관리로 넘어가면 느려지고 복잡해집니다. 정보 구조화 규칙이 없으면 쓰레기통이 되기 쉬우니 주의해야 합니다.
                            </p>
                            <div className="badge-list" style={{ marginTop: "0.75rem" }}>
                                <span className="badge lockinRisk">락인 위험</span>
                            </div>
                        </article>
                    </div>
                </section>

                <section className="community-column">
                    <h2 style={{ marginBottom: "1.5rem" }}>{t.popularDiscussions}</h2>
                    <div className="community-feed">
                        <article className="discussion-item">
                            <h3 className="discussion-title">비동기 협업, 메신저 대신 어떤 걸 쓰시나요?</h3>
                            <p className="discussion-meta">42개의 의견 · 답변 요망</p>
                        </article>

                        <article className="discussion-item">
                            <h3 className="discussion-title">스타트업 초기 태스크 관리, 지라 vs 리니어 고민</h3>
                            <p className="discussion-meta">28개의 의견 · 유용한 팁</p>
                        </article>

                        <article className="discussion-item">
                            <h3 className="discussion-title">가벼운 사내 지식창고(위키) 구축 성공/실패 사례</h3>
                            <p className="discussion-meta">55개의 의견 · 인기 글</p>
                        </article>

                        <article className="discussion-item">
                            <h3 className="discussion-title">디자인 핸드오프 과정에서 병목현상 줄이는 법</h3>
                            <p className="discussion-meta">19개의 의견 · 토론 중</p>
                        </article>
                    </div>
                </section>
            </div>
        </main>
    );
}
