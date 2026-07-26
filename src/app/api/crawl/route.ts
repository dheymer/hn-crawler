import { NextResponse } from "next/server";
import { fetchHNPage, parseHNEntries } from "@/lib/scraper";
import { logUsage } from "@/lib/usageLogger";

/**
 * Fetches the current HN front page, parses the first 30 entries, and
 * logs the request as an unfiltered crawl ("none").
 */
export async function GET() {
  const start = Date.now();

  try {
    const html = await fetchHNPage();
    const entries = parseHNEntries(html);
    const durationMs = Date.now() - start;

    await logUsage({
      filterType: "none",
      resultCount: entries.length,
      durationMs,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    const durationMs = Date.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown crawl error";
    try{
        await logUsage({
            filterType: "none",
            resultCount: 0,
            durationMs,
            success: false,
            errorMessage,
        });
    } catch (e) {
        const eMessage = e instanceof Error ? e.message : "Unknown logging error";
        console.error("Failed to log usage:", eMessage);
    }

    return NextResponse.json({ error: errorMessage }, { status: 502 });
  }
}