"use client";

import type { Tool } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

export function CommunityContent({ tool }: { tool: Tool }) {
    const { t, lang } = useLanguage();

    return (
        <div className="section card">
            <h2>{t.tabCommunity}</h2>
            <p style={{ marginTop: "1rem", color: "var(--color-text-mut)" }}>
                {lang === "ko"
                    ? "비슷한 고민을 하는 사람들과 네트워킹하세요. (준비 중)"
                    : "Network with people facing similar challenges. (Coming soon)"}
            </p>
        </div>
    );
}
