import { prisma } from "./db";
import type { FilterType } from "./filters";

interface LogUsageParams {
  filterType: FilterType;
  resultCount: number;
  durationMs: number;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Records one crawl/filter request in the UsageLog table.
 * Kept as a thin wrapper so call sites (API routes) stay simple, and so
 * this can be unit-tested by mocking `./db` instead of hitting a real
 * database.
 */
export async function logUsage({
  filterType,
  resultCount,
  durationMs,
  success = true,
  errorMessage,
}: LogUsageParams) {
  return prisma.usageLog.create({
    data: { filterType, resultCount, durationMs, success, errorMessage },
  });
}