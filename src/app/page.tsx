"use client";

import { useHNCrawler } from "@/hooks/useHNCrawler";
import { EntryTable } from "@/components/EntryTable";
import { FilterTabs } from "@/components/FilterTabs";

export default function Home() {
  const {
    displayedEntries,
    activeFilter,
    isCrawling,
    isFiltering,
    error,
    crawl,
    applyFilter,
  } = useHNCrawler();

  const hasEntries = displayedEntries !== null;

  return (
    <main className="page">
      <header className="page-header">
        <p className="prompt">$ hn-crawler --limit 30</p>
        <h1>Hacker News Crawler</h1>
        <p className="subtitle">
          Pulls the front page, then filters entries by how many words are in
          the title.
        </p>
      </header>

      <button
        type="button"
        className="crawl-button"
        onClick={crawl}
        disabled={isCrawling}
      >
        {isCrawling ? "Crawling…" : hasEntries ? "Crawl again" : "Run crawl"}
      </button>

      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}

      {hasEntries && (
        <section className="results">
          <FilterTabs
            active={activeFilter}
            onChange={applyFilter}
            disabled={isFiltering}
          />
          {isFiltering ? (
            <p className="loading-note">Applying filter…</p>
          ) : (
            <EntryTable entries={displayedEntries} />
          )}
        </section>
      )}

      {!hasEntries && !isCrawling && (
        <p className="empty-state">
          Nothing crawled yet — run a crawl to pull the current front page.
        </p>
      )}
    </main>
  );
}