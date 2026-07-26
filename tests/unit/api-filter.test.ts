import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/filter/route";
import { logUsage } from "@/lib/usageLogger";

vi.mock("@/lib/usageLogger", () => ({
  logUsage: vi.fn(),
}));

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/filter", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const entries = [
  { rank: 1, title: "Two words", points: 50, comments: 5 }, // 2 words
  { rank: 2, title: "One Two Three Four Five Six", points: 10, comments: 30 }, // 6 words
];

describe("POST /api/filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies the short-title-by-points filter and logs it", async () => {
    const response = await POST(
      makeRequest({ entries, filterType: "short-title-by-points" })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.entries.map((e: { rank: number }) => e.rank)).toEqual([1]);
    expect(logUsage).toHaveBeenCalledWith({
      filterType: "short-title-by-points",
      resultCount: 1,
      durationMs: expect.any(Number),
    });
  });

  it("applies the long-title-by-comments filter and logs it", async () => {
    const response = await POST(
      makeRequest({ entries, filterType: "long-title-by-comments" })
    );
    const body = await response.json();

    expect(body.entries.map((e: { rank: number }) => e.rank)).toEqual([2]);
  });

  it("rejects an invalid filterType with 400 and logs the failure", async () => {
    const response = await POST(makeRequest({ entries, filterType: "bogus" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeDefined();
    expect(logUsage).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});