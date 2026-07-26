# Design decisions

This document explains the key choices behind `hn-crawler` and the reasoning at each step, not just what was built.

## Architecture: Next.js full-stack, no separate backend

The exercise leaves the backend framework open (Node/Express/Nest were all considered). Next.js's own Route Handlers cover everything this project needs — scraping, filtering, and logging — without introducing a second server. For this scope, a separate Express or Nest service would add process/deployment overhead without adding capability. A single project also means a single, coherent commit history, which matters for an exercise being reviewed end to end.

## Scraping: Cheerio, not Puppeteer

Before choosing a scraping approach, the actual HN front page was inspected directly. It's plain, server-rendered HTML — no client-side JavaScript is needed to see the list of entries. That ruled out a headless browser: Cheerio (a jQuery-like HTML parser) is enough, and it's both faster and lighter than spinning up Puppeteer/Chromium for something that doesn't require a real browser.

The parser also had to account for two real quirks found while inspecting HN's actual markup:
- When a post has no comments yet, HN shows the word **"discuss"** instead of "0 comments".
- Comment counts are singular/plural ("1 comment" vs. "270 comments").

Both are handled explicitly in `parseHNEntries` and covered by dedicated unit tests.

## Word counting

The spec's rule ("This is - a self-explained example" → 5 words) implies: split on whitespace, then discard any token that's pure punctuation (like a lone "-"), while keeping hyphenated compounds ("self-explained") intact as a single word. `countWords` implements exactly that, using Unicode letter/digit character classes rather than an ASCII-only regex, so it isn't limited to English titles.

## Filters: client resends entries, no re-crawl

`/api/filter` filters and sorts the 30 entries the client already has from `/api/crawl` — it doesn't re-scrape HN. Two reasons:
1. HN's front page can change between a crawl and a filter click seconds later; filtering the already-crawled snapshot keeps results consistent within a session.
2. It avoids depending on server-side state between requests, which would be unreliable on a serverless deployment where consecutive requests aren't guaranteed to hit the same instance.

**Sort direction assumption:** the spec says "ordered by comments" / "ordered by points" without specifying direction. Both filters sort descending (most comments / most points first), matching the ranking convention of a news site like HN itself. This is called out here explicitly as an assumption, not a certainty read from the spec.

## Usage logging

Beyond the minimum required fields (timestamp, applied filter), the `UsageLog` table also tracks `resultCount`, `durationMs`, `success`, and `errorMessage`. Without these, the log would only prove a request happened — these fields are what actually let you answer questions about crawler behavior (how long do crawls take, do they ever fail, how many results does each filter typically return). Deliberately **not** tracked: IP address or user-agent — there's no clear need for them in this exercise, and not collecting identifiable data by default is a reasonable default.

`filterType` is stored as a plain `String` rather than a Prisma/DB-level enum, since SQLite doesn't support native enums — the `FilterType` TypeScript union type is the actual source of truth for valid values, enforced at the application boundary (Zod, in the API route) instead.

## Why Prisma 6, not 7

`npm install prisma @prisma/client` initially pulled in Prisma 7 (released days before this project started), which turned out to require: a mandatory database driver adapter for every provider, a new `prisma.config.ts` as the source of truth for the datasource connection, and ESM-oriented project settings. None of that adds value for a single-table usage log — it's meaningfully more moving parts for the same result. The project is pinned to Prisma 6 (`prisma@6`, `@prisma/client@6`), which uses the classic, well-documented `prisma-client-js` generator and a single `schema.prisma` as the only source of configuration. This is a deliberate "boring technology" choice given the project's scope and timeline, not an oversight.

## Testing strategy

Three distinct layers, each testing something the others don't:

- **Unit tests** (Vitest) test pure logic in isolation — the scraper's parsing (against a static HTML fixture, not the network), the word counter, the filters, and the API routes (with `fetchHNPage`/`parseHNEntries`/`logUsage` mocked). Fast, deterministic, and they run without a network connection or a live database.
- **E2E tests** (Playwright) run against the real app, hitting the real HN front page and the real SQLite database. This is the layer that actually proves the whole thing works together, at the cost of depending on live data — so these tests assert on *rules* (title word counts, sort order) rather than on specific expected titles.
- One E2E test uses `page.route()` to simulate a failed crawl deterministically, instead of relying on HN actually being down.

## UI

A dark, monospace-leaning look was chosen over a default light dashboard, closer to a terminal/CLI aesthetic that fits a tool literally called a "crawler". State management (`useHNCrawler`) is kept separate from the presentational components (`EntryTable`, `FilterTabs`) so each can be reasoned about independently. Filter tabs use `role="tab"`/`aria-selected` and the table collapses into a card layout on small screens instead of overflowing horizontally.

## Known limitations

- SQLite requires a persistent, writable filesystem; it isn't a good fit for serverless deployments (e.g. Vercel) as-is — see the README's "Known limitations" section for options considered.
- No authentication, rate-limiting, or caching layer — intentionally out of scope for this exercise.