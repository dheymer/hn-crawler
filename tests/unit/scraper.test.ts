import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { parseHNEntries } from "@/lib/scraper";

const fixtureHtml = readFileSync(
  path.join(__dirname, "fixtures/hn-sample.html"),
  "utf-8"
);

describe("parseHNEntries", () => {
  it("extracts all entries with their correct fields", () => {
    const entries = parseHNEntries(fixtureHtml);
    expect(entries).toHaveLength(3);
  });

  it("parses rank, title, and points correctly", () => {
    const [first] = parseHNEntries(fixtureHtml);
    expect(first.rank).toBe(1);
    expect(first.title).toBe("Writing by hand is good for your brain");
    expect(first.points).toBe(543);
  });

  it("handles plural comments (N comments)", () => {
    const [first] = parseHNEntries(fixtureHtml);
    expect(first.comments).toBe(270);
  });

  it("handles singular comments (1 comment)", () => {
    const [, second] = parseHNEntries(fixtureHtml);
    expect(second.comments).toBe(1);
  });

  it('treats "discuss" (no comments yet) as 0', () => {
    const [, , third] = parseHNEntries(fixtureHtml);
    expect(third.comments).toBe(0);
    expect(third.points).toBe(6);
  });

  it("never returns more than 30 entries", () => {
    const entries = parseHNEntries(fixtureHtml);
    expect(entries.length).toBeLessThanOrEqual(30);
  });
});