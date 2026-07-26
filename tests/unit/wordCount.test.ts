import { describe, it, expect } from "vitest";
import { countWords } from "@/lib/wordCount";

describe("countWords", () => {
  it("matches the exact example from the spec", () => {
    expect(countWords("This is - a self-explained example")).toBe(5);
  });

  it("counts a plain sentence with no symbols", () => {
    expect(countWords("Show HN Palmier Pro")).toBe(4);
  });

  it("discards standalone symbol tokens but keeps attached punctuation", () => {
    expect(countWords("Self-driving cars: pros & cons")).toBe(4);
  });

  it("collapses extra whitespace", () => {
    expect(countWords("  Hello   world  ")).toBe(2);
  });

  it("counts numeric tokens as words", () => {
    expect(countWords("Top 10 programming languages of 2026")).toBe(6);
  });

  it("returns 0 for an empty or whitespace-only title", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
  });

  it("returns 0 when the title is only symbols", () => {
    expect(countWords("- -- ...")).toBe(0);
  });
});