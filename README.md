# hn-crawler

Crawls the first 30 entries from the [Hacker News](https://news.ycombinator.com/) front page and lets you filter them by title length, with every crawl and filter operation logged for later analysis.

## What it does

- Crawls the HN front page and extracts rank, title, points, and comment count for the first 30 entries.
- **Long titles, by comments** — entries with more than 5 words in the title, sorted by comment count (descending).
- **Short titles, by points** — entries with 5 words or fewer in the title, sorted by points (descending).
- Logs every crawl and filter request (timestamp, which filter was applied, result count, duration, success/failure) to a local SQLite database.

See [`DESIGN.md`](./DESIGN.md) for the reasoning behind these choices.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Scraping | Cheerio |
| Database | SQLite via Prisma **6** (see [DESIGN.md](./DESIGN.md#why-prisma-6-not-7)) |
| Validation | Zod |
| Styling | Tailwind CSS v4 + custom CSS |
| Unit/API tests | Vitest |
| E2E tests | Playwright |

## Getting started

### Prerequisites

- Node.js ≥ 20.9

### Setup

```bash
git clone <this-repo-url>
cd hn-crawler
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Run crawl**, then try the two filter tabs.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm test` | Run unit tests (Vitest) — fixtures/mocks only, no network or DB |
| `npm run test:e2e` | Run E2E tests (Playwright) — hits the real app and the real HN front page |
| `npm run lint` | ESLint |

## API

| Endpoint | Method | Body | Returns |
|---|---|---|---|
| `/api/crawl` | GET | — | `{ entries: HNEntry[] }` |
| `/api/filter` | POST | `{ entries: HNEntry[], filterType: "long-title-by-comments" \| "short-title-by-points" }` | `{ entries: HNEntry[] }` |

```ts
interface HNEntry {
  rank: number;
  title: string;
  points: number;
  comments: number;
}
```

Both endpoints log the request to the `UsageLog` table, including failures.

## Project structure

```
hn-crawler/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── crawl/route.ts
│   │   │   └── filter/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── EntryTable.tsx
│   │   └── FilterTabs.tsx
│   ├── hooks/
│   │   └── useHNCrawler.ts
│   └── lib/
│       ├── db.ts
│       ├── filters.ts
│       ├── scraper.ts
│       ├── usageLogger.ts
│       └── wordCount.ts
├── tests/
│   ├── e2e/
│   │   └── crawler.spec.ts
│   └── unit/
│       ├── fixtures/hn-sample.html
│       └── *.test.ts
├── DESIGN.md
└── README.md
```

## Testing strategy

- **Unit tests** (`npm test`) never touch the network or the real database — the scraper is tested against a static HTML fixture, and Prisma is mocked when testing the usage logger and the API routes.
- **E2E tests** (`npm run test:e2e`) run against the real app, which crawls the real HN front page and writes to the real SQLite database — this is where the actual integration gets verified.

## Known limitations

- **Deployment on serverless platforms (e.g. Vercel):** SQLite's file needs a persistent, writable filesystem. Serverless functions have an ephemeral filesystem, so the usage log would not reliably persist across invocations there. This is fine for local development and for platforms with persistent disks (Railway, Fly.io, a VM); it would need a hosted database (Postgres, Turso/libSQL, etc.) for a real serverless deployment.
- No authentication or rate-limiting — out of scope for this exercise.

## License

MIT — see [`LICENSE`](./LICENSE).