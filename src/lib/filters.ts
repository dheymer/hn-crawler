import type { HNEntry } from "./scraper";
import { countWords } from "./wordCount";

/**
 * Identifies which filter operation was applied to a request.
 * Reused later by the usage-logging layer (Prisma) and the API routes,
 * so it lives here next to the logic it describes.
 */
export type FilterType = "long-title-by-comments" | "short-title-by-points";

/**
 * Entries with MORE than 5 words in the title, ordered by comments
 * (descending — most-discussed first, matching HN's own ranking convention).
 */
export function filterByLongTitle(entries: HNEntry[]): HNEntry[] {
  return entries
    .filter((entry) => countWords(entry.title) > 5)
    .sort((a, b) => b.comments - a.comments);
}

/**
 * Entries with 5 words or FEWER in the title, ordered by points
 * (descending — highest-scored first).
 */
export function filterByShortTitle(entries: HNEntry[]): HNEntry[] {
  return entries
    .filter((entry) => countWords(entry.title) <= 5)
    .sort((a, b) => b.points - a.points);
}