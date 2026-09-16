import { describe, expect, it } from "vitest";
import { tools } from "@/data/tools";
import { evaluations } from "@/data/evaluations";
import { capabilityProfiles } from "@/data/capabilities";
import { resources } from "@/data/resources";
import { CAPABILITY_KEYS, RESOURCE_GROUPS, RESOURCE_PRICINGS } from "@/lib/types";
import { dictionary } from "@/lib/i18n";
import { getToolInsight } from "@/lib/insights";

const DATE_RE = /^\d{4}-\d{2}(-\d{2})?$/;
const URL_RE = /^https?:\/\/\S+$/;

describe("tool catalog data", () => {
  it("has unique ids and names", () => {
    expect(new Set(tools.map((tool) => tool.id)).size).toBe(tools.length);
    expect(new Set(tools.map((tool) => tool.name)).size).toBe(tools.length);
  });

  it("keeps base fields complete for every tool", () => {
    for (const tool of tools) {
      expect(tool.description.length, tool.name).toBeGreaterThan(10);
      expect(tool.problemContexts.length, tool.name).toBeGreaterThanOrEqual(3);
      expect(tool.alternatives.length, tool.name).toBeGreaterThanOrEqual(2);
      expect(tool.category, tool.name).toBeTruthy();
      expect(tool.website, tool.name).toMatch(URL_RE);
      for (const value of Object.values(tool.impact)) {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      }
    }
  });

  it("maps every home-page problem context to at least one tool", () => {
    for (const problem of dictionary.ko.problems) {
      const matches = tools.filter((tool) =>
        tool.problemContexts.some((context) => context.toLowerCase().includes(problem.toLowerCase()))
      );
      expect(matches.length, problem).toBeGreaterThan(0);
    }
  });
});

describe("researched evaluations", () => {
  it("covers every tool in the catalog", () => {
    for (const tool of tools) {
      expect(evaluations[tool.id], tool.name).toBeDefined();
      expect(getToolInsight(tool).isResearched, tool.name).toBe(true);
    }
  });

  it("has substantive, well-formed content per tool", () => {
    for (const tool of tools) {
      const evaluation = evaluations[tool.id];
      expect(evaluation.oneLine.length, tool.name).toBeGreaterThan(10);
      expect(evaluation.keyFeatures.length, tool.name).toBeGreaterThanOrEqual(4);
      expect(evaluation.pricingSummary.length, tool.name).toBeGreaterThan(10);
      expect(evaluation.comparisons.length, tool.name).toBeGreaterThanOrEqual(3);
      expect(evaluation.patchNotes.length, tool.name).toBeGreaterThanOrEqual(3);
      expect(evaluation.workPlaybook.length, tool.name).toBeGreaterThanOrEqual(3);
      expect(evaluation.externalRatings.length, tool.name).toBeGreaterThanOrEqual(1);
      expect(evaluation.sources.length, tool.name).toBeGreaterThanOrEqual(4);
      expect(evaluation.researchedAt, tool.name).toMatch(/^\d{4}-\d{2}$/);

      for (const value of Object.values(evaluation.scoreBreakdown)) {
        expect(Number.isInteger(value), tool.name).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
      for (const note of evaluation.patchNotes) {
        expect(note.date, `${tool.name} / ${note.title}`).toMatch(DATE_RE);
        expect(note.date >= "2025-01", `${tool.name} / ${note.title}`).toBe(true);
        expect(note.impactLevel, `${tool.name} / ${note.title}`).toBeDefined();
      }
      // 패치 이력은 최신순
      const dates = evaluation.patchNotes.map((note) => note.date);
      expect([...dates].sort().reverse(), tool.name).toEqual(dates);
      for (const source of evaluation.sources) {
        expect(source.url, tool.name).toMatch(URL_RE);
        expect(source.label.length, tool.name).toBeGreaterThan(0);
      }
      const competitors = evaluation.comparisons.map((row) => row.competitor);
      expect(new Set(competitors).size, tool.name).toBe(competitors.length);
    }
  });

  it("exposes a composite score, stars, tier, and rank for every tool", () => {
    for (const tool of tools) {
      const insight = getToolInsight(tool);
      expect(insight.totalScore, tool.name).toBe(insight.score.composite);
      expect(insight.score.stars, tool.name).toBeGreaterThan(0);
      expect(insight.score.stars, tool.name).toBeLessThanOrEqual(5);
      expect(insight.rank?.overall, tool.name).toBeGreaterThanOrEqual(1);
      expect(insight.rank?.total, tool.name).toBe(tools.length);
    }
  });
});

describe("capability profiles", () => {
  it("covers every tool with all capability keys, roles, and team fit", () => {
    for (const tool of tools) {
      const profile = capabilityProfiles[tool.name];
      expect(profile, tool.name).toBeDefined();
      for (const key of CAPABILITY_KEYS) {
        expect(["full", "partial", "none"], `${tool.name}/${key}`).toContain(profile.capabilities[key].level);
      }
      expect(profile.roles.length, tool.name).toBeGreaterThan(0);
      expect(profile.teamFit.length, tool.name).toBeGreaterThan(0);
    }
  });
});

describe("useful sites directory", () => {
  it("has unique names and valid URLs", () => {
    expect(new Set(resources.map((site) => site.name)).size).toBe(resources.length);
    for (const site of resources) {
      expect(site.url, site.name).toMatch(URL_RE);
    }
  });

  it("keeps every entry complete and classified", () => {
    for (const site of resources) {
      expect(RESOURCE_GROUPS, site.name).toContain(site.group);
      expect(RESOURCE_PRICINGS, site.name).toContain(site.pricing);
      expect(["full", "partial", "none"], site.name).toContain(site.koreanFriendly);
      expect(site.tagline.length, site.name).toBeGreaterThan(3);
      expect(site.tagline.length, site.name).toBeLessThanOrEqual(60);
      expect(site.useCase.length, site.name).toBeGreaterThan(20);
      expect(site.strength.length, site.name).toBeGreaterThan(10);
      expect(site.caution.length, site.name).toBeGreaterThan(10);
      expect(site.pricingDetail.length, site.name).toBeGreaterThan(5);
      for (const source of site.sources ?? []) {
        expect(source, site.name).toMatch(URL_RE);
      }
    }
  });

  it("spreads sites across several groups once the directory is filled", () => {
    // 디렉터리가 비어 있는 중간 상태(스캐폴딩만 머지된 시점)에서는 검사를 건너뜁니다.
    if (resources.length === 0) return;
    expect(new Set(resources.map((site) => site.group)).size).toBeGreaterThan(1);
  });
});
