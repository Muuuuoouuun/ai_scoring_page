"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

/**
 * 이전 버전에는 지어낸 활동 지표(최근 리뷰 3 · 토론 신호 4 · 의견 합계 144)와
 * 가상의 사용자(@PM_anna 등)가 실제 데이터인 것처럼 들어가 있었습니다.
 * 사용자가 0명인 상태에서 붐비는 것처럼 보이게 만드는 건 들켰을 때 손해가 가장 큽니다.
 * 서버 저장 리뷰가 붙기 전까지는 준비 중 상태를 정직하게 노출합니다.
 */
export default function CommunityPage() {
    const { lang, t } = useLanguage();

    const plans = [
        {
            ko: { title: "리뷰 피드", desc: "실제로 등록된 사용자 리뷰가 최신순으로 쌓입니다. 서버 저장이 붙는 시점에 열립니다." },
            en: { title: "Review feed", desc: "Real user reviews, newest first. Opens once reviews are stored server-side." }
        },
        {
            ko: { title: "도입 토론", desc: "같은 문제를 겪는 팀끼리 도구 선택 근거를 주고받는 공간입니다." },
            en: { title: "Adoption threads", desc: "Teams facing the same problem compare the reasoning behind their choices." }
        },
        {
            ko: { title: "운영 이슈 제보", desc: "패치나 장애로 실제 업무가 막힌 사례를 검수 후 변경 이력에 반영합니다." },
            en: { title: "Operational reports", desc: "Real breakages get verified, then folded into each tool's change history." }
        }
    ];

    return (
        <main className="community-page">
            <header className="community-hero">
                <div>
                    <span className="section-kicker">COMMUNITY SIGNALS</span>
                    <h1>{t.communityHeadline}</h1>
                    <p className="text-muted">{t.communitySubline}</p>
                </div>
            </header>

            <section className="community-preparing">
                <span className="preparing-tag">
                    {lang === "ko" ? "준비 중" : "In preparation"}
                </span>
                <h2>
                    {lang === "ko"
                        ? "아직 보여드릴 활동이 없습니다"
                        : "There is no activity to show yet"}
                </h2>
                <p>
                    {lang === "ko"
                        ? "커뮤니티 숫자를 지어내는 대신 비워두기로 했습니다. 리뷰가 서버에 저장되기 시작하면 이 자리에 실제 활동이 올라옵니다. 그전까지는 도구 리뷰부터 보시는 편이 낫습니다."
                        : "We'd rather show nothing than invent activity numbers. Once reviews are stored server-side, real activity will appear here. Until then, the tool reviews are the useful part."}
                </p>
                <Link className="button" href="/search">
                    {lang === "ko" ? "도구 리뷰 보러 가기 →" : "Browse tool reviews →"}
                </Link>
            </section>

            <section className="section">
                <div className="journal-section-head">
                    <span className="section-kicker">WHAT GOES HERE</span>
                    <h2>{lang === "ko" ? "이 자리에 들어올 것" : "What will live here"}</h2>
                </div>
                <div className="grid grid-3">
                    {plans.map((plan) => {
                        const copy = lang === "ko" ? plan.ko : plan.en;
                        return (
                            <article className="card" key={copy.title}>
                                <strong>{copy.title}</strong>
                                <p className="text-muted">{copy.desc}</p>
                            </article>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
