import { describe, it, expect, vi, beforeEach } from "vitest";
import { logUsage } from "@/lib/usageLogger";
import { prisma } from "@/lib/db";

// Mocking `./db` means the real PrismaClient (and the SQLite file it would
// open) is never touched — this test only checks that logUsage calls
// Prisma with the right shape of data.
vi.mock("@/lib/db", () => ({
  prisma: {
    usageLog: {
      create: vi.fn(),
    },
  },
}));

describe("logUsage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs a successful crawl with no filter applied", async () => {
    await logUsage({ filterType: "none", resultCount: 30, durationMs: 850 });

    expect(prisma.usageLog.create).toHaveBeenCalledWith({
      data: {
        filterType: "none",
        resultCount: 30,
        durationMs: 850,
        success: true,
        errorMessage: undefined,
      },
    });
  });

  it("logs a successful filter operation", async () => {
    await logUsage({
      filterType: "short-title-by-points",
      resultCount: 12,
      durationMs: 4,
    });

    expect(prisma.usageLog.create).toHaveBeenCalledWith({
      data: {
        filterType: "short-title-by-points",
        resultCount: 12,
        durationMs: 4,
        success: true,
        errorMessage: undefined,
      },
    });
  });

  it("records failures together with their error message", async () => {
    await logUsage({
      filterType: "long-title-by-comments",
      resultCount: 0,
      durationMs: 120,
      success: false,
      errorMessage: "Failed to fetch Hacker News: 503 Service Unavailable",
    });

    expect(prisma.usageLog.create).toHaveBeenCalledWith({
      data: {
        filterType: "long-title-by-comments",
        resultCount: 0,
        durationMs: 120,
        success: false,
        errorMessage: "Failed to fetch Hacker News: 503 Service Unavailable",
      },
    });
  });
});