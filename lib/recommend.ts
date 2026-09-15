import type { Role, TeamSize, Tool, ToolCapabilityProfile } from "@/lib/types";
import type { ToolInsight } from "@/lib/insights";

export type Priority = "speed" | "depth" | "collab" | "stability" | "price";
export type Constraint = "avoidLockin" | "koreanRequired" | "freePlanRequired";

export const PRIORITIES: Priority[] = ["speed", "depth", "collab", "stability", "price"];
export const CONSTRAINTS: Constraint[] = ["avoidLockin", "koreanRequired", "freePlanRequired"];
export const MAX_PRIORITIES = 2;

export type RecommendationInput = {
  role?: Role;
  teamSize?: TeamSize;
  priorities: Priority[];
  constraints: Constraint[];
};

export type Recommendation = {
  tool: Tool;
  insight: ToolInsight;
  fit: number;
  reasons: string[];
  warnings: string[];
};

type Lang = "ko" | "en";

const ROLE_NAMES: Record<Role, { ko: string; en: string }> = {
  pm: { ko: "PM/기획", en: "PM" },
  marketing: { ko: "마케팅", en: "Marketing" },
  sales: { ko: "세일즈", en: "Sales" },
  engineering: { ko: "엔지니어링", en: "Engineering" },
  design: { ko: "디자인", en: "Design" },
  ops: { ko: "운영", en: "Operations" },
  research: { ko: "리서치", en: "Research" }
};

const TEAM_NAMES: Record<TeamSize, { ko: string; en: string }> = {
  solo: { ko: "1인", en: "Solo" },
  small: { ko: "소규모(2~10명)", en: "Small (2–10)" },
  mid: { ko: "중규모(11~50명)", en: "Mid (11–50)" },
  large: { ko: "대규모(50명+)", en: "Large (50+)" }
};

const PRIORITY_NAMES: Record<Priority, { ko: string; en: string }> = {
  speed: { ko: "실행 속도", en: "Speed" },
  depth: { ko: "사고 깊이", en: "Thinking depth" },
  collab: { ko: "협업 명확성", en: "Collaboration" },
  stability: { ko: "안정성", en: "Stability" },
  price: { ko: "가격 합리성", en: "Price" }
};

export const roleName = (role: Role, lang: Lang) => ROLE_NAMES[role][lang];
export const teamName = (team: TeamSize, lang: Lang) => TEAM_NAMES[team][lang];
export const priorityName = (priority: Priority, lang: Lang) => PRIORITY_NAMES[priority][lang];

/** 우선순위별 0~1 정규화 지표 */
const priorityMetric = (priority: Priority, tool: Tool, insight: ToolInsight): number => {
  switch (priority) {
    case "speed":
      return (tool.impact.judgmentSpeed + tool.impact.executionDensity) / 20;
    case "depth":
      return tool.impact.thinkingDepth / 10;
    case "collab":
      return tool.impact.collaborationClarity / 10;
    case "stability":
      return insight.scoreBreakdown.reliability / 100;
    case "price":
      return insight.scoreBreakdown.pricing / 100;
  }
};

const priorityEvidence = (priority: Priority, tool: Tool, insight: ToolInsight, lang: Lang): string => {
  switch (priority) {
    case "speed":
      return lang === "ko"
        ? `판단 속도 ${tool.impact.judgmentSpeed}/10, 실행 밀도 ${tool.impact.executionDensity}/10`
        : `judgment speed ${tool.impact.judgmentSpeed}/10, execution density ${tool.impact.executionDensity}/10`;
    case "depth":
      return lang === "ko" ? `사고 깊이 ${tool.impact.thinkingDepth}/10` : `thinking depth ${tool.impact.thinkingDepth}/10`;
    case "collab":
      return lang === "ko"
        ? `협업 명확성 ${tool.impact.collaborationClarity}/10`
        : `collaboration clarity ${tool.impact.collaborationClarity}/10`;
    case "stability":
      return lang === "ko"
        ? `에러/안정성 ${insight.scoreBreakdown.reliability}점`
        : `reliability ${insight.scoreBreakdown.reliability}`;
    case "price":
      return lang === "ko"
        ? `가격 합리성 ${insight.scoreBreakdown.pricing}점`
        : `pricing fairness ${insight.scoreBreakdown.pricing}`;
  }
};

export type RecommendContext = {
  insightOf: (tool: Tool) => ToolInsight;
  profileOf: (tool: Tool) => ToolCapabilityProfile | undefined;
  lang: Lang;
};

export const scoreRecommendation = (
  tool: Tool,
  input: RecommendationInput,
  context: RecommendContext
): Recommendation => {
  const { lang } = context;
  const insight = context.insightOf(tool);
  const profile = context.profileOf(tool);
  const reasons: string[] = [];
  const warnings: string[] = [];
  let fit = 0;

  // 1) 종합 점수 (최대 35)
  fit += (insight.totalScore / 100) * 35;
  reasons.push(
    lang === "ko"
      ? `종합 점수 ${insight.totalScore}점 (전체 ${insight.rank?.total ?? "-"}개 중 ${insight.rank?.overall ?? "-"}위)`
      : `Composite score ${insight.totalScore} (rank ${insight.rank?.overall ?? "-"} of ${insight.rank?.total ?? "-"})`
  );

  // 2) 우선순위 적합도 (최대 35)
  const priorities = input.priorities.slice(0, MAX_PRIORITIES);
  if (priorities.length > 0) {
    const metrics = priorities.map((priority) => priorityMetric(priority, tool, insight));
    const mean = metrics.reduce((sum, value) => sum + value, 0) / metrics.length;
    fit += mean * 35;
    priorities.forEach((priority, index) => {
      if (metrics[index] >= 0.7) {
        reasons.push(
          lang === "ko"
            ? `'${priorityName(priority, lang)}' 우선순위에 강점: ${priorityEvidence(priority, tool, insight, lang)}`
            : `Strong on '${priorityName(priority, lang)}': ${priorityEvidence(priority, tool, insight, lang)}`
        );
      } else if (metrics[index] < 0.5) {
        warnings.push(
          lang === "ko"
            ? `'${priorityName(priority, lang)}' 기준은 약한 편입니다 (${priorityEvidence(priority, tool, insight, lang)})`
            : `Weak on '${priorityName(priority, lang)}' (${priorityEvidence(priority, tool, insight, lang)})`
        );
      }
    });
  } else {
    const values = Object.values(tool.impact);
    fit += (values.reduce((sum, value) => sum + value, 0) / (values.length * 10)) * 35;
  }

  // 3) 직군 적합 (최대 15)
  if (input.role) {
    if (!profile) {
      fit += 7;
    } else if (profile.roles.includes(input.role)) {
      fit += 15;
      reasons.push(
        lang === "ko"
          ? `${roleName(input.role, lang)} 직군에 적합한 도구로 분류`
          : `Classified as a good fit for ${roleName(input.role, lang)} roles`
      );
    }
  } else {
    fit += 10;
  }

  // 4) 팀 규모 적합 (최대 10)
  if (input.teamSize) {
    if (!profile) {
      fit += 5;
    } else if (profile.teamFit.includes(input.teamSize)) {
      fit += 10;
      reasons.push(
        lang === "ko"
          ? `${teamName(input.teamSize, lang)} 팀 규모에 맞는 요금제/관리 기능`
          : `Plans and admin controls fit ${teamName(input.teamSize, lang)} teams`
      );
    } else {
      warnings.push(
        lang === "ko"
          ? `${teamName(input.teamSize, lang)} 팀에는 요금제나 관리 기능이 잘 맞지 않을 수 있습니다`
          : `Plans or admin controls may not suit ${teamName(input.teamSize, lang)} teams`
      );
    }
  } else {
    fit += 7;
  }

  // 5) 제약 조건 (감점/가점)
  if (input.constraints.includes("avoidLockin")) {
    if (tool.verdictBadges.lockinRisk) {
      fit -= 20;
      warnings.push(lang === "ko" ? "락인 위험 배지가 있어 전환 비용을 고려해야 합니다" : "Lock-in risk flagged; consider switching costs");
    } else {
      fit += 5;
      reasons.push(lang === "ko" ? "락인 위험 배지 없음" : "No lock-in risk flag");
    }
  }
  if (input.constraints.includes("koreanRequired")) {
    const level = profile?.capabilities.koreanSupport?.level;
    if (level === "full") {
      fit += 5;
      reasons.push(lang === "ko" ? "한국어 UI와 AI 응답 모두 지원" : "Korean UI and Korean AI output supported");
    } else if (level === "partial") {
      warnings.push(
        lang === "ko"
          ? `한국어 지원이 부분적입니다${profile?.capabilities.koreanSupport?.note ? ` (${profile.capabilities.koreanSupport.note})` : ""}`
          : "Korean support is partial"
      );
    } else if (level === "none") {
      fit -= 30;
      warnings.push(lang === "ko" ? "한국어를 지원하지 않습니다" : "No Korean support");
    }
  }
  if (input.constraints.includes("freePlanRequired")) {
    const level = profile?.capabilities.freePlan?.level;
    if (level === "full") {
      fit += 5;
      reasons.push(lang === "ko" ? "상시 무료 플랜 제공" : "Ongoing free plan available");
    } else if (level === "partial") {
      warnings.push(
        lang === "ko"
          ? `무료 플랜이 제한적입니다${profile?.capabilities.freePlan?.note ? ` (${profile.capabilities.freePlan.note})` : ""}`
          : "Free plan is limited"
      );
    } else if (level === "none") {
      fit -= 30;
      warnings.push(lang === "ko" ? "무료 플랜이 없습니다" : "No free plan");
    }
  }

  if (tool.verdictBadges.thinkCarefully) {
    warnings.push(lang === "ko" ? "신중한 사용 배지: 운영 원칙과 검수 규칙이 필요합니다" : "Think-carefully flag: needs usage rules and review");
  }

  return {
    tool,
    insight,
    fit: Math.round(Math.max(0, Math.min(100, fit))),
    reasons: reasons.slice(0, 4),
    warnings: warnings.slice(0, 3)
  };
};

export const recommendTools = (
  tools: Tool[],
  input: RecommendationInput,
  context: RecommendContext,
  limit = 5
): Recommendation[] =>
  tools
    .filter((tool) => !tool.discontinued)
    .map((tool) => scoreRecommendation(tool, input, context))
    .sort((a, b) => b.fit - a.fit || b.insight.totalScore - a.insight.totalScore)
    .slice(0, limit);

// ---------- 유사 도구 (상세 페이지 "함께 비교할 도구") ----------

const tokens = (value: string | undefined) =>
  new Set(
    (value ?? "")
      .toLowerCase()
      .split(/[^a-z0-9가-힣]+/)
      .filter((token) => token.length > 1)
  );

const cosine = (a: Tool["impact"], b: Tool["impact"]) => {
  const keys = Object.keys(a) as Array<keyof Tool["impact"]>;
  const dot = keys.reduce((sum, key) => sum + a[key] * b[key], 0);
  const normA = Math.sqrt(keys.reduce((sum, key) => sum + a[key] ** 2, 0));
  const normB = Math.sqrt(keys.reduce((sum, key) => sum + b[key] ** 2, 0));
  return normA && normB ? dot / (normA * normB) : 0;
};

export const similarityScore = (
  a: Tool,
  b: Tool,
  profileOf?: (tool: Tool) => ToolCapabilityProfile | undefined
): number => {
  let score = 0;
  const sharedContexts = a.problemContexts.filter((context) => b.problemContexts.includes(context)).length;
  score += sharedContexts * 3;

  const categoryOverlap = Array.from(tokens(a.category)).filter((token) => tokens(b.category).has(token)).length;
  if (categoryOverlap > 0) score += 2;

  const lowerA = a.alternatives.map((alt) => alt.toLowerCase());
  const lowerB = b.alternatives.map((alt) => alt.toLowerCase());
  if (lowerA.includes(b.name.toLowerCase()) || lowerB.includes(a.name.toLowerCase())) score += 3;

  score += cosine(a.impact, b.impact) * 2;

  if (profileOf) {
    const rolesA = profileOf(a)?.roles ?? [];
    const rolesB = profileOf(b)?.roles ?? [];
    score += rolesA.filter((role) => rolesB.includes(role)).length * 0.75;
  }

  const badgeKeys = Object.keys(a.verdictBadges) as Array<keyof Tool["verdictBadges"]>;
  score += badgeKeys.filter((key) => a.verdictBadges[key] === b.verdictBadges[key]).length * 0.25;
  return score;
};

export const recommendSimilar = (
  tool: Tool,
  tools: Tool[],
  limit = 3,
  profileOf?: (tool: Tool) => ToolCapabilityProfile | undefined
): Tool[] =>
  tools
    .filter((candidate) => candidate.id !== tool.id && !candidate.discontinued)
    .map((candidate) => ({ candidate, score: similarityScore(tool, candidate, profileOf) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
