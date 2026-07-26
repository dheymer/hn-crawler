import { test, expect, type Page } from "@playwright/test";
import { countWords } from "@/lib/wordCount";

/**
 * These tests run against the real app, which in turn crawls the real
 * Hacker News front page. That's deliberate: the unit tests already cover
 * parsing, word-counting, filtering and logging in isolation with
 * fixtures and mocks — this file's job is to prove the real integration
 * (browser -> API route -> scraper -> HN -> back to the browser) actually
 * works end to end, on live data.
 */

async function runCrawl(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /run crawl/i }).click();
  await expect(page.locator(".entry-table tbody tr")).toHaveCount(30, {
    timeout: 15_000,
  });
}

async function getColumnNumbers(page: Page, column: 3 | 4): Promise<number[]> {
  const cells = await page
    .locator(`.entry-table tbody tr td:nth-child(${column})`)
    .allTextContents();
  return cells.map((text) => Number(text.trim()));
}

async function getTitles(page: Page): Promise<string[]> {
  return page.locator(".entry-table tbody tr td:nth-child(2)").allTextContents();
}

function isSortedDescending(values: number[]): boolean {
  return values.every((value, index) => index === 0 || values[index - 1] >= value);
}

test("crawls Hacker News and shows the first 30 entries", async ({ page }) => {
  await runCrawl(page);
  await expect(page.locator(".entry-table tbody tr")).toHaveCount(30);
});

test("filters long titles and sorts them by comments, descending", async ({
  page,
}) => {
  await runCrawl(page);
  await page.getByRole("tab", { name: /long titles/i }).click();
  await expect(page.locator(".loading-note")).toHaveCount(0);

  const titles = await getTitles(page);
  const comments = await getColumnNumbers(page, 4);

  expect(titles.length).toBeGreaterThan(0);
  for (const title of titles) {
    expect(countWords(title)).toBeGreaterThan(5);
  }
  expect(isSortedDescending(comments)).toBe(true);
});

test("filters short titles and sorts them by points, descending", async ({
  page,
}) => {
  await runCrawl(page);
  await page.getByRole("tab", { name: /short titles/i }).click();
  await expect(page.locator(".loading-note")).toHaveCount(0);

  const titles = await getTitles(page);
  const points = await getColumnNumbers(page, 3);

  expect(titles.length).toBeGreaterThan(0);
  for (const title of titles) {
    expect(countWords(title)).toBeLessThanOrEqual(5);
  }
  expect(isSortedDescending(points)).toBe(true);
});

test("shows an error banner when the crawl fails", async ({ page }) => {
  await page.route("**/api/crawl", (route) =>
    route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({
        error: "Failed to fetch Hacker News: 503 Service Unavailable",
      }),
    })
  );

  await page.goto("/");
  await page.getByRole("button", { name: /run crawl/i }).click();

  await expect(page.locator(".error-banner")).toContainText(
    "Failed to fetch Hacker News"
  );
});