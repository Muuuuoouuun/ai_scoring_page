import { describe, expect, it } from "vitest";
import type { ResourceSite } from "@/lib/types";
import { RESOURCE_GROUPS } from "@/lib/types";
import { filterResources, groupResources } from "@/lib/resources";

const site = (overrides: Partial<ResourceSite>): ResourceSite => ({
  name: "Example",
  url: "https://example.com",
  group: "reference",
  tagline: "예시 사이트",
  useCase: "테스트에서 쓰는 예시 사이트입니다.",
  pricing: "free",
  pricingDetail: "완전 무료입니다.",
  koreanFriendly: "full",
  strength: "예시로 쓰기 좋습니다.",
  caution: "실제 사이트가 아닙니다.",
  alternatives: ["Other"],
  ...overrides
});

const sites: ResourceSite[] = [
  site({ name: "Pinterest", group: "reference", pricing: "free", koreanFriendly: "full", tagline: "이미지 핀보드" }),
  site({ name: "Mobbin", group: "reference", pricing: "freemium", koreanFriendly: "partial", tagline: "앱 UI 아카이브" }),
  site({ name: "Magnific", group: "imageTools", pricing: "paid", koreanFriendly: "none", tagline: "업스케일 도구" }),
  site({ name: "Noonnu", group: "assets", pricing: "free", koreanFriendly: "full", tagline: "한국어 무료 폰트" })
];

describe("filterResources", () => {
  it("returns everything when no filter is set", () => {
    expect(filterResources(sites, {})).toHaveLength(4);
  });

  it("filters by group", () => {
    expect(filterResources(sites, { group: "reference" }).map((item) => item.name)).toEqual(["Pinterest", "Mobbin"]);
  });

  it("drops paid sites when free-only is on", () => {
    expect(filterResources(sites, { freeOnly: true }).some((item) => item.pricing === "paid")).toBe(false);
  });

  it("drops English-only sites when Korean-only is on", () => {
    expect(filterResources(sites, { koreanOnly: true }).map((item) => item.name)).toEqual([
      "Pinterest",
      "Mobbin",
      "Noonnu"
    ]);
  });

  it("matches the query against name and descriptive fields", () => {
    expect(filterResources(sites, { query: "업스케일" }).map((item) => item.name)).toEqual(["Magnific"]);
    expect(filterResources(sites, { query: "mobbin" }).map((item) => item.name)).toEqual(["Mobbin"]);
    expect(filterResources(sites, { query: "없는검색어" })).toHaveLength(0);
  });

  it("combines filters", () => {
    expect(filterResources(sites, { group: "reference", freeOnly: true, koreanOnly: true }).map((i) => i.name)).toEqual([
      "Pinterest",
      "Mobbin"
    ]);
  });
});

describe("groupResources", () => {
  it("orders groups canonically and omits empty ones", () => {
    const grouped = groupResources(sites);
    expect(grouped.map((entry) => entry.group)).toEqual(["reference", "assets", "imageTools"]);
    expect(grouped.every(({ group }) => RESOURCE_GROUPS.includes(group))).toBe(true);
    expect(grouped[0].sites).toHaveLength(2);
  });

  it("returns nothing for an empty list", () => {
    expect(groupResources([])).toHaveLength(0);
  });
});
