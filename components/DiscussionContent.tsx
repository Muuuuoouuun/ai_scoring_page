"use client";

import type { Tool } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

export function DiscussionContent({ tool }: { tool: Tool }) {
    const { t, lang } = useLanguage();

    return (
        <div className="section card">
            <h2>{t.tabDiscussion}</h2>
            <p style={{ marginTop: "1rem", color: "var(--color-text-mut)" }}>
                {lang === "ko"
                    ? "이 도구의 장단점에 대해 자유롭게 토론해보세요. (준비 중)"
                    : "Discuss the pros and cons of this tool freely. (Coming soon)"}
            </p>
        </div>
    );
}
