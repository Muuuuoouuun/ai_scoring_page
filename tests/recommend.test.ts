import { describe, expect, it } from "vitest";
import type { Tool, ToolCapabilityProfile } from "@/lib/types";
import { getToolInsight } from "@/lib/insights";
import { recommendSimilar, recommendTools, scoreRecommendation } from "@/lib/recommend";
import { summarizeRatings } from "@/lib/reviews";
import { summarizeDifferences } from "@/lib/compare";

const makeTool = (overrides: Partial<Tool>): Tool => ({
  id: overrides.id ?? "tool",
  name: overrides.name ?? "Tool",
  description: "테스트용 도구 설명입니다.",
  problemContexts: ["작업이 흩어져 있다"],
  whyExist: "테스트를 위해 존재합니다.",
  impact: { judgmentSpeed: 5, thinkingDepth: 5, executionDensity: 5, collaborationClarity: 5 },
  bestCase: "최선의 경우 설명입니다.",
  worstCase: "최악의 경우 설명입니다.",
  verdictBadges: { timeSaver: true, thinkCarefully: false, lockinRisk: false },
  alternatives: ["Other"],
  category: "테스트",
  website: "https://example.com",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...overrides
});

const profileWith = (korean: "full" | "partial" | "none", free: "full" | "partial" | "none"): ToolCapabilityProfile => ({
  capabilities: {
    freePlan: { level: free },
    koreanSupport: { level: korean },
    aiAssistant: { level: "full" },
    agentAutomation: { level: "partial" },
    apiIntegrations: { level: "full" },
    teamAdmin: { level: "full" },
    dataExport: { level: "full" },
    ssoSecurity: { level: "partial" },
    mobileApp: { level: "full" },
    offlineLocal: { level: "none" }
  },
  roles: ["pm", "ops"],
  teamFit: ["small", "mid"]
});

const context = (profiles: Record<string, ToolCapabilityProfile>) => ({
  insightOf: getToolInsight,
  profileOf: (tool: Tool) => profiles[tool.name],
  lang: "ko" as const
});

describe("recommendation engine", () => {
  it("penalizes tools that violate hard constraints", () => {
    const korean = makeTool({ id: "k", name: "Korean" });
    const english = makeTool({ id: "e", name: "English" });
    const profiles = { Korean: profileWith("full", "full"), English: profileWith("none", "none") };
    const ranked = recommendTools([english, korean], { priorities: [], constraints: ["koreanRequired", "freePlanRequired"] }, context(profiles));
    expect(ranked[0].tool.name).toBe("Korean");
    expect(ranked[1].warnings.join(" ")).toContain("한국어");
    expect(ranked[1].warnings.join(" ")).toContain("무료");
  });

  it("penalizes lock-in when the user wants to avoid it", () => {
    const locked = makeTool({ id: "l", name: "Locked", verdictBadges: { timeSaver: true, thinkCarefully: false, lockinRisk: true } });
    const open = makeTool({ id: "o", name: "Open" });
    const [first, second] = recommendTools([locked, open], { priorities: [], constraints: ["avoidLockin"] }, context({}));
    expect(first.tool.name).toBe("Open");
    expect(second.fit).toBeLessThan(first.fit);
  });

  it("re-ranks by the selected priority", () => {
    const fast = makeTool({ id: "f", name: "Fast", impact: { judgmentSpeed: 9, thinkingDepth: 3, executionDensity: 9, collaborationClarity: 4 } });
    const deep = makeTool({ id: "d", name: "Deep", impact: { judgmentSpeed: 4, thinkingDepth: 9, executionDensity: 4, collaborationClarity: 5 } });
    expect(recommendTools([fast, deep], { priorities: ["speed"], constraints: [] }, context({}))[0].tool.name).toBe("Fast");
    expect(recommendTools([fast, deep], { priorities: ["depth"], constraints: [] }, context({}))[0].tool.name).toBe("Deep");
  });

  it("rewards role and team fit and explains it", () => {
    const tool = makeTool({ id: "t", name: "Fit" });
    const result = scoreRecommendation(tool, { role: "pm", teamSize: "small", priorities: [], constraints: [] }, context({ Fit: profileWith("full", "full") }));
    expect(result.reasons.join(" ")).toContain("PM/기획");
    expect(result.reasons.join(" ")).toContain("소규모");
    expect(result.fit).toBeGreaterThan(0);
    expect(result.fit).toBeLessThanOrEqual(100);
  });
});

describe("similar tools", () => {
  it("prefers shared problem contexts, alternatives, and category", () => {
    const base = makeTool({ id: "b", name: "Base", problemContexts: ["A", "B"], alternatives: ["Rival"], category: "AI 코딩" });
    const rival = makeTool({ id: "r", name: "Rival", problemContexts: ["A", "B"], category: "AI 코딩 / IDE" });
    const other = makeTool({ id: "o", name: "Other", problemContexts: ["Z"], category: "디자인" });
    const result = recommendSimilar(base, [base, other, rival], 2);
    expect(result.map((tool) => tool.name)).toEqual(["Rival", "Other"]);
  });
});

describe("rating summary", () => {
  it("averages and buckets star ratings", () => {
    const summary = summarizeRatings([
      { id: "1", nickname: "a", line: "x", detail: "", rating: 5, createdAt: "" },
      { id: "2", nickname: "b", line: "y", detail: "", rating: 4, createdAt: "" },
      { id: "3", nickname: "c", line: "z", detail: "", rating: 7, createdAt: "" }
    ]);
    expect(summary.count).toBe(3);
    expect(summary.average).toBe(4.7);
    expect(summary.distribution[5]).toBe(2);
    expect(summary.distribution[4]).toBe(1);
  });
});

describe("compare summary", () => {
  it("describes leaders, capability gaps, and badge differences", () => {
    const a = makeTool({ id: "a", name: "Alpha", verdictBadges: { timeSaver: true, thinkCarefully: false, lockinRisk: true } });
    const b = makeTool({ id: "b", name: "Beta", impact: { judgmentSpeed: 9, thinkingDepth: 5, executionDensity: 5, collaborationClarity: 5 } });
    const lines = summarizeDifferences(
      [
        { tool: a, insight: getToolInsight(a), profile: profileWith("none", "full") },
        { tool: b, insight: getToolInsight(b), profile: profileWith("full", "full") }
      ],
      "ko"
    );
    expect(lines.some((line) => line.includes("판단 속도") && line.includes("Beta"))).toBe(true);
    expect(lines.some((line) => line.includes("한국어 지원") && line.includes("Beta"))).toBe(true);
    expect(lines.some((line) => line.includes("락인 위험") && line.includes("Alpha"))).toBe(true);
  });
});
