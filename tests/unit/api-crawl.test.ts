import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/crawl/route";
import { fetchHNPage, parseHNEntries } from "@/lib/scraper";
import { logUsage } from "@/lib/usageLogger";

vi.mock("@/lib/scraper", () => ({
  fetchHNPage: vi.fn(),
  parseHNEntries: vi.fn(),
}));

vi.mock("@/lib/usageLogger", () => ({
  logUsage: vi.fn(),
}));

describe("GET /api/crawl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the parsed entries and logs a successful crawl", async () => {
    vi.mocked(fetchHNPage).mockResolvedValue("<html></html>");
    vi.mocked(parseHNEntries).mockReturnValue([
      { rank: 1, title: "Example", points: 10, comments: 2 },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.entries).toHaveLength(1);
    expect(logUsage).toHaveBeenCalledWith({
      filterType: "none",
      resultCount: 1,
      durationMs: expect.any(Number),
    });
  });

  it("logs a failure and returns 502 when the crawl fails", async () => {
    vi.mocked(fetchHNPage).mockRejectedValue(
      new Error("Failed to fetch Hacker News: 503 Service Unavailable")
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toContain("503");
    expect(logUsage).toHaveBeenCalledWith({
      filterType: "none",
      resultCount: 0,
      durationMs: expect.any(Number),
      success: false,
      errorMessage: "Failed to fetch Hacker News: 503 Service Unavailable",
    });
  });
});