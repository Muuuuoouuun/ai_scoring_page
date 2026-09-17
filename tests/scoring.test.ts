import { describe, expect, it } from "vitest";
import {
  computeCompositeScore,
  computeEditorialScore,
  computeExternalScore,
  parseRatingScore,
  rankItems,
  scoreTier,
  scoreToStars,
  SCORE_WEIGHTS
} from "@/lib/scoring";

describe("parseRatingScore", () => {
  it("normalizes fractions, percentages, and bare numbers", () => {
    expect(parseRatingScore("4.7/5")?.normalized).toBe(94);
    expect(parseRatingScore("9.1 / 10")?.normalized).toBe(91);
    expect(parseRatingScore("92/100")?.normalized).toBe(92);
    expect(parseRatingScore("82.3%")?.normalized).toBe(82.3);
    expect(parseRatingScore("4.5")?.normalized).toBe(90);
  });

  it("rejects strings that are not ratings", () => {
    expect(parseRatingScore("G2 91건 리뷰(확인 필요)")).toBeNull();
    expect(parseRatingScore("6/5")).toBeNull();
    expect(parseRatingScore("")).toBeNull();
  });
});

describe("editorial and composite scores", () => {
  it("weights sum to one and the editorial score is a weighted mean", () => {
    const sum = Object.values(SCORE_WEIGHTS).reduce((acc, value) => acc + value, 0);
    expect(sum).toBeCloseTo(1, 10);
    expect(computeEditorialScore({ functionality: 100, uiux: 100, reliability: 100, comfort: 100, pricing: 100 })).toBe(100);
    expect(computeEditorialScore({ functionality: 100, uiux: 0, reliability: 0, comfort: 0, pricing: 0 })).toBe(25);
  });

  it("blends external ratings with source weights and ignores unparseable entries", () => {
    const external = computeExternalScore([
      { source: "G2", score: "4.5/5" },
      { source: "Trustpilot", score: "1.5/5" },
      { source: "UX Tools 설문조사(재인용)", score: "n/a" }
    ]);
    expect(external?.count).toBe(2);
    // (90*1 + 30*0.5) / 1.5 = 70
    expect(external?.score).toBe(70);
    expect(computeExternalScore([{ source: "G2", score: "리뷰 91건" }])).toBeNull();
  });

  it("falls back to the editorial score without external ratings", () => {
    expect(computeCompositeScore(80, null)).toBe(80);
    expect(computeCompositeScore(80, 90)).toBe(83);
  });

  it("maps scores to stars and tiers", () => {
    expect(scoreToStars(84)).toBe(4.2);
    expect(scoreToStars(101)).toBe(5);
    expect(scoreTier(85)).toBe("strong");
    expect(scoreTier(76)).toBe("recommended");
    expect(scoreTier(65)).toBe("conditional");
    expect(scoreTier(64)).toBe("caution");
  });
});

describe("rankItems", () => {
  it("ranks overall and within category with ties sharing a rank", () => {
    const items = [
      { id: "a", category: "x", score: 90 },
      { id: "b", category: "x", score: 90 },
      { id: "c", category: "y", score: 70 },
      { id: "d", score: 60 }
    ];
    const ranks = rankItems(items, (item) => item.score);
    expect(ranks.get("a")?.overall).toBe(1);
    expect(ranks.get("b")?.overall).toBe(1);
    expect(ranks.get("c")?.overall).toBe(3);
    expect(ranks.get("d")?.overall).toBe(4);
    expect(ranks.get("c")?.category).toBe(1);
    expect(ranks.get("c")?.categoryTotal).toBe(1);
    expect(ranks.get("d")?.category).toBeUndefined();
  });
});
