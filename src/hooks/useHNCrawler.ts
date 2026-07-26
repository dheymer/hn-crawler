"use client";

import { useCallback, useState } from "react";
import type { HNEntry } from "@/lib/scraper";
import type { FilterType } from "@/lib/filters";

interface CrawlState {
  entries: HNEntry[] | null;
  displayedEntries: HNEntry[] | null;
  activeFilter: FilterType;
  isCrawling: boolean;
  isFiltering: boolean;
  error: string | null;
}

const initialState: CrawlState = {
  entries: null,
  displayedEntries: null,
  activeFilter: "none",
  isCrawling: false,
  isFiltering: false,
  error: null,
};

/**
 * Owns all client-side state and network calls for the crawler UI, kept
 * separate from the components so those stay purely presentational and
 * easy to reason about independently.
 */
export function useHNCrawler() {
  const [state, setState] = useState<CrawlState>(initialState);

  const crawl = useCallback(async () => {
    setState((s) => ({ ...s, isCrawling: true, error: null }));

    try {
      const res = await fetch("/api/crawl");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to crawl Hacker News");
      }

      setState({
        entries: data.entries,
        displayedEntries: data.entries,
        activeFilter: "none",
        isCrawling: false,
        isFiltering: false,
        error: null,
      });
    } catch (error) {
      setState((s) => ({
        ...s,
        isCrawling: false,
        error:
          error instanceof Error ? error.message : "Failed to crawl Hacker News",
      }));
    }
  }, []);

  const applyFilter = useCallback(
    async (filterType: FilterType) => {
      if (!state.entries) return;

      if (filterType === "none") {
        setState((s) => ({
          ...s,
          activeFilter: "none",
          displayedEntries: state.entries,
        }));
        return;
      }

      setState((s) => ({
        ...s,
        isFiltering: true,
        activeFilter: filterType,
        error: null,
      }));

      try {
        const res = await fetch("/api/filter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: state.entries, filterType }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Failed to apply filter");
        }

        setState((s) => ({ ...s, displayedEntries: data.entries, isFiltering: false }));
      } catch (error) {
        setState((s) => ({
          ...s,
          isFiltering: false,
          error: error instanceof Error ? error.message : "Failed to apply filter",
        }));
      }
    },
    [state.entries]
  );

  return { ...state, crawl, applyFilter };
}