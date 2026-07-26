import { describe, it, expect } from "vitest";
import type { HNEntry } from "@/lib/scraper";
import { filterByLongTitle, filterByShortTitle } from "@/lib/filters";

const entries: HNEntry[] = [
  { rank: 1, title: "Two words", points: 50, comments: 5 }, // 2 words
  { rank: 2, title: "This is - a self-explained example", points: 20, comments: 100 }, // 5 words
  { rank: 3, title: "One Two Three Four Five Six", points: 10, comments: 30 }, // 6 words
  { rank: 4, title: "Alpha Beta Gamma Delta Epsilon Zeta Eta", points: 90, comments: 10 }, // 7 words
  { rank: 5, title: "Short title here now", points: 5, comments: 200 }, // 4 words
];

describe("filterByShortTitle", () => {
  it("keeps only entries with 5 words or fewer", () => {
    const result = filterByShortTitle(entries);
    expect(result.map((e) => e.rank)).toEqual([1, 2, 5]);
  });

  it("orders the result by points, descending", () => {
    const result = filterByShortTitle(entries);
    expect(result.map((e) => e.points)).toEqual([50, 20, 5]);
  });

  it("does not mutate the original array", () => {
    const original = [...entries];
    filterByShortTitle(entries);
    expect(entries).toEqual(original);
  });
});

describe("filterByLongTitle", () => {
  it("keeps only entries with more than 5 words", () => {
    const result = filterByLongTitle(entries);
    expect(result.map((e) => e.rank)).toEqual([3, 4]);
  });

  it("orders the result by comments, descending", () => {
    const result = filterByLongTitle(entries);
    expect(result.map((e) => e.comments)).toEqual([30, 10]);
  });
});