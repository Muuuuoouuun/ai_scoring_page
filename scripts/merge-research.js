/* eslint-disable no-console */
/**
 * 연구 결과 JSON(스크래치패드의 research/*.json)을 읽어
 * data/tools.ts 와 data/evaluations.ts 를 생성합니다.
 *
 * 사용: node scripts/merge-research.js <research-dir>
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const researchDir = process.argv[2];
if (!researchDir) {
  console.error("usage: node scripts/merge-research.js <research-dir>");
  process.exit(1);
}

// 기존 도구는 id/createdAt 을 유지합니다.
const EXISTING = {
  Notion: { id: "d41f50a2-3b7c-4f7e-8c73-1b8d0b0fe21a", createdAt: "2024-02-01T10:00:00Z" },
  Figma: { id: "55d7ad1a-4c1c-4e58-a2d6-40a00d092e2a", createdAt: "2024-02-02T10:00:00Z" },
  Slack: { id: "ef6b79b4-7c1e-4df0-95f1-9011f412e1cb", createdAt: "2024-02-03T10:00:00Z" },
  Linear: { id: "f33e7f82-0d1c-4f57-9c5f-9a8e8e251e88", createdAt: "2024-02-04T10:00:00Z" },
  Airtable: { id: "58dc3f0a-6e9d-4f21-a7c5-2e2186a42e8f", createdAt: "2024-02-05T10:00:00Z" },
  Miro: { id: "a1aa1f1d-67f8-4dbd-aec0-2ed51b932d0a", createdAt: "2024-02-06T10:00:00Z" },
  Zapier: { id: "b559d3ef-7c52-4ed0-9e84-2f5b1a9775b4", createdAt: "2024-02-07T10:00:00Z" },
  Jasper: { id: "6b6f9d15-0a05-4c34-8a6b-4d6b5a6ae7ea", createdAt: "2024-02-08T10:00:00Z" },
  Gong: { id: "d07d34fb-2cd2-4fcb-95dd-e1fceaa52d27", createdAt: "2024-02-09T10:00:00Z" },
  Replit: { id: "e357c35d-bfd4-4c14-aad0-9910de98837f", createdAt: "2024-02-10T10:00:00Z" }
};

// 파일 순서 = 사이트 노출 순서
const BATCH_ORDER = [
  "existing-a.json",
  "existing-b.json",
  "ai-assistants.json",
  "ai-builders.json",
  "ai-browsers-agents.json",
  "ai-video.json",
  "ai-audio-image.json"
];
// 유용한 사이트 디렉터리 (레퍼런스/에셋/이미지 도구/유틸)
const RESOURCE_FILES = ["resources-reference.json", "resources-utility.json"];
const UPDATED_AT = "2026-09-15T00:00:00Z";

const deterministicId = (name) => {
  const hex = crypto.createHash("sha1").update(`g2-tool:${name}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};

const warnings = [];
const warn = (tool, msg) => warnings.push(`[${tool}] ${msg}`);

const assertString = (tool, field, value, { min = 1, max = Infinity } = {}) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    warn(tool, `${field} 누락`);
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.length < min) warn(tool, `${field} 짧음 (${trimmed.length} < ${min})`);
  if (trimmed.length > max) warn(tool, `${field} 길이 ${trimmed.length} > ${max}`);
  return trimmed;
};

const assertInt = (tool, field, value, min, max) => {
  if (!Number.isInteger(value) || value < min || value > max) {
    warn(tool, `${field} 범위 오류: ${value}`);
    return Math.max(min, Math.min(max, Math.round(Number(value) || min)));
  }
  return value;
};

const isHttps = (url) => typeof url === "string" && /^https?:\/\/\S+$/.test(url);

const normalizeTool = (raw) => {
  const name = assertString("?", "name", raw.name);
  const t = name || "unknown";
  const existing = EXISTING[name];
  const ev = raw.evaluation || {};
  if (raw.verified === false) warn(t, "verified=false (웹 검증 실패 표시)");

  const problemContexts = (raw.problemContexts || []).map((c, i) => assertString(t, `problemContexts[${i}]`, c, { max: 40 })).filter(Boolean);
  if (problemContexts.length < 3) warn(t, `problemContexts ${problemContexts.length}개 (<3)`);

  const alternatives = (raw.alternatives || []).map((a, i) => assertString(t, `alternatives[${i}]`, a)).filter(Boolean);
  if (alternatives.length < 2) warn(t, `alternatives ${alternatives.length}개 (<2)`);

  const tool = {
    id: existing ? existing.id : deterministicId(name),
    name,
    description: assertString(t, "description", raw.description, { min: 10, max: 120 }),
    problemContexts,
    whyExist: assertString(t, "whyExist", raw.whyExist, { min: 10 }),
    impact: {
      judgmentSpeed: assertInt(t, "impact.judgmentSpeed", raw.impact?.judgmentSpeed, 1, 10),
      thinkingDepth: assertInt(t, "impact.thinkingDepth", raw.impact?.thinkingDepth, 1, 10),
      executionDensity: assertInt(t, "impact.executionDensity", raw.impact?.executionDensity, 1, 10),
      collaborationClarity: assertInt(t, "impact.collaborationClarity", raw.impact?.collaborationClarity, 1, 10)
    },
    bestCase: assertString(t, "bestCase", raw.bestCase, { min: 10 }),
    worstCase: assertString(t, "worstCase", raw.worstCase, { min: 10 }),
    verdictBadges: {
      timeSaver: Boolean(raw.verdictBadges?.timeSaver),
      thinkCarefully: Boolean(raw.verdictBadges?.thinkCarefully),
      lockinRisk: Boolean(raw.verdictBadges?.lockinRisk)
    },
    alternatives,
    category: assertString(t, "category", raw.category, { max: 40 }),
    website: isHttps(raw.website) ? raw.website : (warn(t, "website URL 오류"), ""),
    ...(raw.discontinued === true ? { discontinued: true } : {}),
    createdAt: existing ? existing.createdAt : UPDATED_AT,
    updatedAt: UPDATED_AT
  };

  const keyFeatures = (ev.keyFeatures || []).map((f, i) => assertString(t, `keyFeatures[${i}]`, f, { max: 110 })).filter(Boolean);
  if (keyFeatures.length < 4) warn(t, `keyFeatures ${keyFeatures.length}개 (<4)`);

  const comparisons = (ev.comparisons || []).map((c, i) => ({
    competitor: assertString(t, `comparisons[${i}].competitor`, c.competitor),
    worksBetterHere: assertString(t, `comparisons[${i}].worksBetterHere`, c.worksBetterHere, { min: 10 }),
    weakerHere: assertString(t, `comparisons[${i}].weakerHere`, c.weakerHere, { min: 10 })
  }));
  if (comparisons.length < 3) warn(t, `comparisons ${comparisons.length}개 (<3)`);

  const patchNotes = (ev.patchNotes || []).map((n, i) => {
    const date = assertString(t, `patchNotes[${i}].date`, n.date);
    if (!/^\d{4}-\d{2}(-\d{2})?$/.test(date)) warn(t, `patchNotes[${i}].date 형식 오류: ${date}`);
    else if (date < "2025-01") warn(t, `patchNotes[${i}].date 2025년 이전: ${date}`);
    else if (date > "2026-09-30") warn(t, `patchNotes[${i}].date 미래 날짜: ${date}`);
    const impactLevel = ["high", "medium", "low"].includes(n.impactLevel) ? n.impactLevel : undefined;
    if (!impactLevel) warn(t, `patchNotes[${i}].impactLevel 누락`);
    return {
      date,
      title: assertString(t, `patchNotes[${i}].title`, n.title),
      change: assertString(t, `patchNotes[${i}].change`, n.change, { min: 10 }),
      errorRisk: assertString(t, `patchNotes[${i}].errorRisk`, n.errorRisk, { min: 10 }),
      ...(impactLevel ? { impactLevel } : {})
    };
  }).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  if (patchNotes.length < 3) warn(t, `patchNotes ${patchNotes.length}개 (<3)`);

  const workPlaybook = (ev.workPlaybook || []).map((p, i) => ({
    title: assertString(t, `workPlaybook[${i}].title`, p.title, { max: 40 }),
    howToUse: assertString(t, `workPlaybook[${i}].howToUse`, p.howToUse, { min: 10 }),
    recommendation: assertString(t, `workPlaybook[${i}].recommendation`, p.recommendation, { min: 10 })
  }));
  if (workPlaybook.length < 3) warn(t, `workPlaybook ${workPlaybook.length}개 (<3)`);

  const externalRatings = (ev.externalRatings || []).map((r, i) => ({
    source: assertString(t, `externalRatings[${i}].source`, r.source),
    score: assertString(t, `externalRatings[${i}].score`, r.score),
    ...(r.note ? { note: String(r.note).trim() } : {}),
    ...(isHttps(r.url) ? { url: r.url } : {})
  }));
  if (externalRatings.length < 2) warn(t, `externalRatings ${externalRatings.length}개 (<2)`);

  const seen = new Set();
  const sources = (ev.sources || [])
    .filter((s) => {
      if (!isHttps(s.url)) { warn(t, `sources URL 오류: ${s.url}`); return false; }
      if (seen.has(s.url)) return false;
      seen.add(s.url);
      return true;
    })
    .map((s, i) => ({ label: assertString(t, `sources[${i}].label`, s.label), url: s.url }));
  if (sources.length < 4) warn(t, `sources ${sources.length}개 (<4)`);

  const sb = ev.scoreBreakdown || {};
  const evaluation = {
    oneLine: assertString(t, "oneLine", ev.oneLine, { min: 10, max: 140 }),
    scoreBreakdown: {
      functionality: assertInt(t, "scoreBreakdown.functionality", sb.functionality, 0, 100),
      uiux: assertInt(t, "scoreBreakdown.uiux", sb.uiux, 0, 100),
      reliability: assertInt(t, "scoreBreakdown.reliability", sb.reliability, 0, 100),
      comfort: assertInt(t, "scoreBreakdown.comfort", sb.comfort, 0, 100),
      pricing: assertInt(t, "scoreBreakdown.pricing", sb.pricing, 0, 100)
    },
    keyFeatures,
    pricingSummary: assertString(t, "pricingSummary", ev.pricingSummary, { min: 10 }),
    ...(ev.koreaNote && String(ev.koreaNote).trim() ? { koreaNote: String(ev.koreaNote).trim() } : {}),
    comparisons,
    patchNotes,
    workPlaybook,
    externalRatings,
    sources,
    researchedAt: /^\d{4}-\d{2}$/.test(ev.researchedAt || "") ? ev.researchedAt : "2026-09"
  };

  return { tool, evaluation };
};

// ---------- TS 직렬화 (기존 data/tools.ts 스타일: 키 따옴표 없음, 2칸 들여쓰기) ----------
const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const serialize = (value, indent = 0) => {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const simple = value.every((v) => typeof v !== "object" || v === null);
    if (simple) {
      const inline = `[${value.map((v) => serialize(v, indent + 1)).join(", ")}]`;
      if (inline.length + pad.length <= 100) return inline;
    }
    return `[\n${value.map((v) => `${padIn}${serialize(v, indent + 1)}`).join(",\n")}\n${pad}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return "{}";
    const inline = `{ ${entries.map(([k, v]) => `${IDENT.test(k) ? k : JSON.stringify(k)}: ${serialize(v, indent + 1)}`).join(", ")} }`;
    const simple = entries.every(([, v]) => typeof v !== "object" || v === null);
    if (simple && inline.length + pad.length <= 100) return inline;
    return `{\n${entries.map(([k, v]) => `${padIn}${IDENT.test(k) ? k : JSON.stringify(k)}: ${serialize(v, indent + 1)}`).join(",\n")}\n${pad}}`;
  }
  return JSON.stringify(value);
};

// ---------- 실행 ----------
const files = BATCH_ORDER.filter((f) => fs.existsSync(path.join(researchDir, f)));
const missing = BATCH_ORDER.filter((f) => !files.includes(f));
if (missing.length) console.warn(`누락된 연구 파일: ${missing.join(", ")}`);

const merged = [];
const embeddedProfiles = [];
for (const file of files) {
  const raw = JSON.parse(fs.readFileSync(path.join(researchDir, file), "utf8"));
  if (!Array.isArray(raw)) throw new Error(`${file}: 배열이 아닙니다`);
  for (const item of raw) {
    merged.push(normalizeTool(item));
    // 도구 객체 안에 기능 매트릭스를 함께 넣어 온 배치를 지원합니다.
    if (item.capabilityProfile) embeddedProfiles.push({ ...item.capabilityProfile, name: item.name });
  }
}

const names = new Set();
for (const { tool } of merged) {
  if (names.has(tool.name)) warn(tool.name, "이름 중복");
  names.add(tool.name);
}

const toolsTs = `import type { Tool } from "@/lib/types";

/**
 * 도구 기본 데이터. 평가 상세(점수, 비교, 패치 이력, 출처)는 data/evaluations.ts 에 있습니다.
 * scripts/merge-research.js 로 생성됩니다. 조사 기준: ${UPDATED_AT.slice(0, 7)}
 */
export const tools: Tool[] = ${serialize(merged.map((m) => m.tool))};
`;

const evaluationsTs = `import type { ToolEvaluation } from "@/lib/types";

/**
 * 도구 id → 조사 기반 평가 데이터.
 * 공식 체인지로그, 가격 페이지, G2/Capterra/Product Hunt 등 외부 사이트를 참고해 채웠습니다.
 * scripts/merge-research.js 로 생성됩니다. 조사 기준: ${UPDATED_AT.slice(0, 7)}
 */
export const evaluations: Record<string, ToolEvaluation> = {
${merged.map((m) => `  // ${m.tool.name}\n  "${m.tool.id}": ${serialize(m.evaluation, 1)}`).join(",\n")}
};
`;

// ---------- 기능 지원 매트릭스 / 직군 / 팀 규모 (capabilities.json, 도구 이름 기준) ----------
const CAPABILITY_KEYS = ["freePlan", "koreanSupport", "aiAssistant", "agentAutomation", "apiIntegrations", "teamAdmin", "dataExport", "ssoSecurity", "mobileApp", "offlineLocal"];
const ROLES = ["pm", "marketing", "sales", "engineering", "design", "ops", "research"];
const TEAM_SIZES = ["solo", "small", "mid", "large"];
const LEVELS = ["full", "partial", "none"];

const normalizeProfile = (raw) => {
  const name = String(raw.name || "").trim();
  const t = name || "unknown";
  if (raw.verified === false) warn(t, "capabilities verified=false");
  const capabilities = {};
  for (const key of CAPABILITY_KEYS) {
    const entry = raw.capabilities?.[key] || {};
    const level = LEVELS.includes(entry.level) ? entry.level : (warn(t, `capabilities.${key}.level 누락/오류 → partial`), "partial");
    const note = entry.note ? String(entry.note).trim() : "";
    if (note.length > 60) warn(t, `capabilities.${key}.note 길이 ${note.length} > 60`);
    capabilities[key] = note ? { level, note } : { level };
  }
  const roles = (raw.roles || []).filter((role) => ROLES.includes(role));
  if (roles.length === 0) warn(t, "roles 비어 있음");
  const teamFit = (raw.teamFit || []).filter((size) => TEAM_SIZES.includes(size));
  if (teamFit.length === 0) warn(t, "teamFit 비어 있음");
  const sources = (raw.sources || []).filter(isHttps);
  return { name, profile: { capabilities, roles, teamFit, ...(sources.length ? { sources } : {}) } };
};

const capabilityFile = path.join(researchDir, "capabilities.json");
const rawProfileInputs = [...embeddedProfiles];
if (fs.existsSync(capabilityFile)) {
  const fromFile = JSON.parse(fs.readFileSync(capabilityFile, "utf8"));
  if (!Array.isArray(fromFile)) throw new Error("capabilities.json: 배열이 아닙니다");
  rawProfileInputs.push(...fromFile);
} else if (embeddedProfiles.length === 0) {
  console.warn("누락된 연구 파일: capabilities.json (data/capabilities.ts 는 갱신하지 않음)");
}

let profiles = [];
if (rawProfileInputs.length > 0) {
  const seenProfiles = new Set();
  profiles = rawProfileInputs
    .map(normalizeProfile)
    .filter((item) => {
      if (!item.name || seenProfiles.has(item.name)) return false;
      seenProfiles.add(item.name);
      return true;
    });
  // 도구 순서와 맞춰 두면 생성 파일이 읽기 쉽습니다.
  const order = new Map(merged.map((m, index) => [m.tool.name, index]));
  profiles.sort((a, b) => (order.get(a.name) ?? 999) - (order.get(b.name) ?? 999));
  const toolNames = new Set(merged.map((m) => m.tool.name));
  for (const item of profiles) if (!toolNames.has(item.name)) warn(item.name, "capabilities에만 있고 도구 목록에 없음");
  for (const name of Array.from(toolNames)) if (!profiles.some((item) => item.name === name)) warn(name, "capabilities 누락");
}

// ---------- 유용한 사이트 디렉터리 ----------
const RESOURCE_GROUPS = ["reference", "assets", "imageTools", "devUtil"];
const PRICING_MAP = { "무료": "free", "부분 무료": "freemium", "유료": "paid" };

const normalizeResource = (raw) => {
  const name = assertString("?", "resource.name", raw.name);
  const t = name || "unknown-resource";
  if (raw.verified === false) warn(t, "resource verified=false");
  const group = RESOURCE_GROUPS.includes(raw.group) ? raw.group : (warn(t, `group 오류: ${raw.group}`), "devUtil");
  const pricing = PRICING_MAP[String(raw.pricingLabel || "").trim()] ||
    (warn(t, `pricingLabel 오류: ${raw.pricingLabel} → freemium`), "freemium");
  const koreanFriendly = LEVELS.includes(raw.koreanFriendly)
    ? raw.koreanFriendly
    : (warn(t, `koreanFriendly 오류: ${raw.koreanFriendly} → partial`), "partial");
  const alternatives = (raw.alternatives || []).map(String).map((a) => a.trim()).filter(Boolean);
  if (alternatives.length === 0) warn(t, "alternatives 비어 있음");
  const sources = (raw.sources || []).filter(isHttps);
  if (sources.length === 0) warn(t, "sources 비어 있음");
  return {
    name,
    url: isHttps(raw.url) ? raw.url : (warn(t, `url 오류: ${raw.url}`), ""),
    group,
    tagline: assertString(t, "tagline", raw.tagline, { max: 60 }),
    useCase: assertString(t, "useCase", raw.useCase, { min: 20 }),
    pricing,
    pricingDetail: assertString(t, "pricingDetail", raw.pricingDetail, { min: 5 }),
    koreanFriendly,
    strength: assertString(t, "strength", raw.strength, { min: 10 }),
    caution: assertString(t, "caution", raw.caution, { min: 10 }),
    alternatives,
    ...(sources.length ? { sources } : {})
  };
};

const resourceFiles = RESOURCE_FILES.filter((f) => fs.existsSync(path.join(researchDir, f)));
const missingResources = RESOURCE_FILES.filter((f) => !resourceFiles.includes(f));
if (missingResources.length) console.warn(`누락된 사이트 파일: ${missingResources.join(", ")}`);

const resources = [];
const seenResourceNames = new Set();
for (const file of resourceFiles) {
  const raw = JSON.parse(fs.readFileSync(path.join(researchDir, file), "utf8"));
  if (!Array.isArray(raw)) throw new Error(`${file}: 배열이 아닙니다`);
  for (const item of raw) {
    const site = normalizeResource(item);
    if (!site.name || !site.url) continue;
    if (seenResourceNames.has(site.name)) {
      warn(site.name, "사이트 이름 중복 (건너뜀)");
      continue;
    }
    seenResourceNames.add(site.name);
    resources.push(site);
  }
}
// 그룹 순서대로 정렬해 페이지에서 바로 쓸 수 있게 합니다.
resources.sort((a, b) => RESOURCE_GROUPS.indexOf(a.group) - RESOURCE_GROUPS.indexOf(b.group));

const outDir = process.env.OUT_DIR || path.join(__dirname, "..", "data");
fs.mkdirSync(outDir, { recursive: true });
// 도구 배치가 하나도 없으면 기존 파일을 비우지 않고 그대로 둡니다.
if (merged.length > 0) {
  fs.writeFileSync(path.join(outDir, "tools.ts"), toolsTs);
  fs.writeFileSync(path.join(outDir, "evaluations.ts"), evaluationsTs);
} else {
  console.warn("도구 배치가 없어 tools.ts / evaluations.ts 는 갱신하지 않았습니다.");
}
if (profiles.length > 0) {
  const capabilitiesTs = `import type { ToolCapabilityProfile } from "@/lib/types";

/**
 * 도구 이름 → 기능 지원 매트릭스(지원/부분 지원/미지원), 적합 직군, 적합 팀 규모.
 * 공식 가격/도움말 페이지와 외부 리뷰를 참고해 채웠습니다. scripts/merge-research.js 로 생성됩니다. 조사 기준: ${UPDATED_AT.slice(0, 7)}
 */
export const capabilityProfiles: Record<string, ToolCapabilityProfile> = {
${profiles.map((item) => `  ${JSON.stringify(item.name)}: ${serialize(item.profile, 1)}`).join(",\n")}
};
`;
  fs.writeFileSync(path.join(outDir, "capabilities.ts"), capabilitiesTs);
}

if (resources.length > 0) {
  const resourcesTs = `import type { ResourceSite } from "@/lib/types";

/**
 * 실무에서 자주 여는 레퍼런스·에셋·이미지·유틸리티 사이트 모음.
 * scripts/merge-research.js 로 생성됩니다. 조사 기준: ${UPDATED_AT.slice(0, 7)}
 */
export const resources: ResourceSite[] = ${serialize(resources)};
`;
  fs.writeFileSync(path.join(outDir, "resources.ts"), resourcesTs);
}

console.log(`도구 ${merged.length}개, 사이트 ${resources.length}개 생성 → ${outDir}`);
if (warnings.length) {
  console.log(`경고 ${warnings.length}건:`);
  for (const w of warnings) console.log("  - " + w);
}
