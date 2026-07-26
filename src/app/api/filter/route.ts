import { NextResponse } from "next/server";
import { z } from "zod";
import { filterByLongTitle, filterByShortTitle } from "@/lib/filters";
import { logUsage } from "@/lib/usageLogger";

const hnEntrySchema = z.object({
  rank: z.number(),
  title: z.string(),
  points: z.number(),
  comments: z.number(),
});

const filterRequestSchema = z.object({
  entries: z.array(hnEntrySchema),
  filterType: z.enum(["long-title-by-comments", "short-title-by-points"]),
});

/**
 * Applies one of the two filter/sort operations to an already-crawled set
 * of entries. The client sends back the entries it received from
 * /api/crawl instead of us re-fetching HN, so filtering is instant and
 * doesn't depend on HN's front page staying the same between requests.
 */
export async function POST(request: Request) {
  const start = Date.now();
  const body = await request.json();
  const parsed = filterRequestSchema.safeParse(body);

  if (!parsed.success) {
    const durationMs = Date.now() - start;

    await logUsage({
      filterType: "none",
      resultCount: 0,
      durationMs,
      success: false,
      errorMessage: "Invalid filter request body",
    });

    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { entries, filterType } = parsed.data;

  const filtered =
    filterType === "long-title-by-comments"
      ? filterByLongTitle(entries)
      : filterByShortTitle(entries);

  const durationMs = Date.now() - start;

  await logUsage({
    filterType,
    resultCount: filtered.length,
    durationMs,
  });

  return NextResponse.json({ entries: filtered });
}