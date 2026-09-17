import type { Tool, ToolCapabilityProfile, CapabilityKey } from "@/lib/types";
import { CAPABILITY_KEYS } from "@/lib/types";
import type { ToolInsight } from "@/lib/insights";

export const COMPARE_KEY = "g2-compare-tray";
export const COMPARE_EVENT = "g2-compare-changed";
export const COMPARE_MAX = 3;

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const readCompareIds = (): string[] => {
  if (!canUseStorage()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(COMPARE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string").slice(0, COMPARE_MAX) : [];
  } catch {
    return [];
  }
};

export const writeCompareIds = (ids: string[]) => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(COMPARE_KEY, JSON.stringify(ids.slice(0, COMPARE_MAX)));
    window.dispatchEvent(new CustomEvent(COMPARE_EVENT));
  } catch {
    // ignore storage failures
  }
};

export const toggleCompareId = (id: string): { ids: string[]; added: boolean; rejected: boolean } => {
  const current = readCompareIds();
  if (current.includes(id)) {
    const ids = current.filter((item) => item !== id);
    writeCompareIds(ids);
    return { ids, added: false, rejected: false };
  }
  if (current.length >= COMPARE_MAX) {
    return { ids: current, added: false, rejected: true };
  }
  const ids = [...current, id];
  writeCompareIds(ids);
  return { ids, added: true, rejected: false };
};

export const compareHref = (ids: string[]) => `/compare?ids=${ids.map(encodeURIComponent).join(",")}`;

export type CompareEntry = {
  tool: Tool;
  insight: ToolInsight;
  profile?: ToolCapabilityProfile;
};

const SCORE_AXES: Array<{ key: keyof ToolInsight["scoreBreakdown"]; ko: string; en: string }> = [
  { key: "functionality", ko: "기능 완성도", en: "Functionality" },
  { key: "uiux", ko: "UI/UX", en: "UI/UX" },
  { key: "reliability", ko: "에러/안정성", en: "Reliability" },
  { key: "comfort", ko: "쾌적도", en: "Comfort" },
  { key: "pricing", ko: "가격 합리성", en: "Pricing fairness" }
];

const IMPACT_AXES: Array<{ key: keyof Tool["impact"]; ko: string; en: string }> = [
  { key: "judgmentSpeed", ko: "판단 속도", en: "Judgment speed" },
  { key: "thinkingDepth", ko: "사고 깊이", en: "Thinking depth" },
  { key: "executionDensity", ko: "실행 밀도", en: "Execution density" },
  { key: "collaborationClarity", ko: "협업 명확성", en: "Collaboration clarity" }
];

const CAPABILITY_NAMES: Record<CapabilityKey, { ko: string; en: string }> = {
  freePlan: { ko: "무료 플랜", en: "Free plan" },
  koreanSupport: { ko: "한국어 지원", en: "Korean support" },
  aiAssistant: { ko: "AI 어시스턴트 내장", en: "Built-in AI assistant" },
  agentAutomation: { ko: "에이전트 자동화", en: "Agent automation" },
  apiIntegrations: { ko: "API/연동 생태계", en: "API & integrations" },
  teamAdmin: { ko: "팀 권한·관리자 제어", en: "Team admin controls" },
  dataExport: { ko: "데이터 내보내기", en: "Data export" },
  ssoSecurity: { ko: "SSO/보안 인증", en: "SSO & security" },
  mobileApp: { ko: "모바일 앱", en: "Mobile app" },
  offlineLocal: { ko: "오프라인/로컬", en: "Offline / local" }
};

export const capabilityName = (key: CapabilityKey, lang: "ko" | "en") => CAPABILITY_NAMES[key][lang];

/** 한글 단어의 받침 유무에 따라 조사를 고릅니다 (한글이 아니면 받침 없는 쪽을 씁니다). */
const josa = (word: string, withBatchim: string, withoutBatchim: string) => {
  const code = word.charCodeAt(word.length - 1);
  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - 0xac00) % 28 === 0 ? withoutBatchim : withBatchim;
  }
  return withoutBatchim;
};

const leaders = <T>(entries: T[], valueOf: (entry: T) => number): { winners: T[]; value: number } => {
  const max = Math.max(...entries.map(valueOf));
  return { winners: entries.filter((entry) => valueOf(entry) === max), value: max };
};

/** 비교 대상 도구들 사이의 차이를 문장으로 요약합니다 (축별 선두, 고유 기능 지원, 배지 차이). */
export const summarizeDifferences = (entries: CompareEntry[], lang: "ko" | "en"): string[] => {
  if (entries.length < 2) return [];
  const lines: string[] = [];

  const composite = leaders(entries, (entry) => entry.insight.totalScore);
  if (composite.winners.length < entries.length) {
    const names = composite.winners.map((entry) => entry.tool.name).join(", ");
    lines.push(
      lang === "ko"
        ? `종합 점수는 ${names} 쪽이 가장 높습니다 (${composite.value}점).`
        : `${names} lead on composite score (${composite.value}).`
    );
  }

  for (const axis of SCORE_AXES) {
    const result = leaders(entries, (entry) => entry.insight.scoreBreakdown[axis.key]);
    const min = Math.min(...entries.map((entry) => entry.insight.scoreBreakdown[axis.key]));
    if (result.winners.length === entries.length || result.value - min < 8) continue;
    const names = result.winners.map((entry) => entry.tool.name).join(", ");
    lines.push(
      lang === "ko"
        ? `${axis.ko}${josa(axis.ko, "은", "는")} ${names} 쪽이 앞섭니다 (${result.value}점, 최저 ${min}점).`
        : `${names} lead on ${axis.en.toLowerCase()} (${result.value} vs. lowest ${min}).`
    );
  }

  for (const axis of IMPACT_AXES) {
    const result = leaders(entries, (entry) => entry.tool.impact[axis.key]);
    const min = Math.min(...entries.map((entry) => entry.tool.impact[axis.key]));
    if (result.winners.length === entries.length || result.value - min < 2) continue;
    const names = result.winners.map((entry) => entry.tool.name).join(", ");
    lines.push(
      lang === "ko"
        ? `${axis.ko}${josa(axis.ko, "은", "는")} ${names} 쪽이 가장 높습니다 (${result.value}/10, 최저 ${min}/10).`
        : `${names} score highest on ${axis.en.toLowerCase()} (${result.value}/10 vs. ${min}/10).`
    );
  }

  const withProfiles = entries.filter((entry) => entry.profile);
  if (withProfiles.length >= 2) {
    for (const key of CAPABILITY_KEYS) {
      const full = withProfiles.filter((entry) => entry.profile?.capabilities[key]?.level === "full");
      const none = withProfiles.filter((entry) => entry.profile?.capabilities[key]?.level === "none");
      if (full.length > 0 && full.length < withProfiles.length && none.length > 0) {
        const names = full.map((entry) => entry.tool.name).join(", ");
        const missing = none.map((entry) => entry.tool.name).join(", ");
        lines.push(
          lang === "ko"
            ? `${CAPABILITY_NAMES[key].ko}: 완전 지원은 ${names}뿐이고, ${missing} 쪽은 지원하지 않습니다.`
            : `${CAPABILITY_NAMES[key].en}: only ${names} fully support it; ${missing} do not.`
        );
      }
    }
  }

  const lockin = entries.filter((entry) => entry.tool.verdictBadges.lockinRisk);
  if (lockin.length > 0 && lockin.length < entries.length) {
    const names = lockin.map((entry) => entry.tool.name).join(", ");
    lines.push(lang === "ko" ? `락인 위험 배지: ${names}.` : `Lock-in risk flagged: ${names}.`);
  }
  const caution = entries.filter((entry) => entry.tool.verdictBadges.thinkCarefully);
  if (caution.length > 0 && caution.length < entries.length) {
    const names = caution.map((entry) => entry.tool.name).join(", ");
    lines.push(lang === "ko" ? `신중한 사용 배지: ${names}.` : `Think-carefully flagged: ${names}.`);
  }

  return lines;
};
