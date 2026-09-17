/**
 * 루트 g2 앱의 조사 데이터를 site/ (AIs) 앱 구조로 옮깁니다.
 *  - data/evaluations.ts + capabilities.ts + tools.ts → site/data/evaluations.json (카탈로그 id 기준)
 *  - data/resources.ts                                → site/data/resources.json
 *
 * 실행: node --experimental-strip-types scripts/port-to-site.mjs
 */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitePath = (...parts) => path.join(root, "site", ...parts);

const {tools} = await import(path.join(root, "data/tools.ts"));
const {evaluations} = await import(path.join(root, "data/evaluations.ts"));
const {capabilityProfiles} = await import(path.join(root, "data/capabilities.ts"));
const {resources} = await import(path.join(root, "data/resources.ts"));
const catalog = JSON.parse(fs.readFileSync(sitePath("data/catalog.json"), "utf8"));

/** 루트 도구 이름 → site 카탈로그 id. 이름이 다른 항목만 명시합니다. */
const NAME_OVERRIDES = {
  "NotebookLM": "notebooklm",
  "Microsoft 365 Copilot": "microsoft-copilot"
};

const byName = new Map(catalog.map((t) => [t.name.toLowerCase(), t.id]));
const catalogIds = new Set(catalog.map((t) => t.id));

const resolveId = (name) => {
  const override = NAME_OVERRIDES[name];
  if (override) return catalogIds.has(override) ? override : null;
  const direct = byName.get(name.toLowerCase());
  return direct ?? null;
};

const ported = {};
const unmatched = [];

for (const tool of tools) {
  const id = resolveId(tool.name);
  if (!id) {
    unmatched.push(tool.name);
    continue;
  }
  const ev = evaluations[tool.id];
  const profile = capabilityProfiles[tool.name];
  if (!ev) continue;

  ported[id] = {
    sourceName: tool.name,
    verdict: ev.oneLine,
    scores: ev.scoreBreakdown,
    impact: tool.impact,
    badges: tool.verdictBadges,
    pricingSummary: ev.pricingSummary,
    ...(ev.koreaNote ? {koreaNote: ev.koreaNote} : {}),
    comparisons: ev.comparisons.map((c) => ({competitor: c.competitor, better: c.worksBetterHere, weaker: c.weakerHere})),
    history: ev.patchNotes.map((n) => ({date: n.date, title: n.title, change: n.change, risk: n.errorRisk, level: n.impactLevel ?? "medium"})),
    playbook: ev.workPlaybook.map((p) => ({title: p.title, how: p.howToUse, tip: p.recommendation})),
    externalRatings: ev.externalRatings,
    ...(profile ? {capabilities: profile.capabilities, roles: profile.roles, teamFit: profile.teamFit} : {}),
    sources: ev.sources,
    checkedAt: ev.researchedAt
  };
}

const portedResources = resources.map((site) => ({
  name: site.name,
  url: site.url,
  group: site.group,
  tagline: site.tagline,
  useCase: site.useCase,
  pricing: site.pricing,
  pricingDetail: site.pricingDetail,
  koreanFriendly: site.koreanFriendly,
  strength: site.strength,
  caution: site.caution,
  alternatives: site.alternatives,
  ...(site.sources ? {sources: site.sources} : {})
}));

fs.writeFileSync(sitePath("data/evaluations.json"), JSON.stringify(ported, null, 1) + "\n");
fs.writeFileSync(sitePath("data/resources.json"), JSON.stringify(portedResources, null, 1) + "\n");

console.log(`평가 ${Object.keys(ported).length}개 → site/data/evaluations.json`);
console.log(`사이트 ${portedResources.length}개 → site/data/resources.json`);
if (unmatched.length) console.log(`카탈로그에 없어 제외한 도구 ${unmatched.length}개: ${unmatched.join(", ")}`);
