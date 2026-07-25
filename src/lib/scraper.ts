import * as cheerio from "cheerio";

export interface HNEntry {
  rank: number;
  title: string;
  points: number;
  comments: number;
}

const HN_URL = "https://news.ycombinator.com/";

/**
 * Fetches the HTML of the Hacker News front page.
 * Kept separate from parseHNEntries so the parsing logic can be tested
 * with fixtures, without depending on the network in unit tests.
 */
export async function fetchHNPage(url: string = HN_URL): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "hn-crawler-exercise/1.0" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Hacker News: ${res.status} ${res.statusText}`);
  }

  return res.text();
}

/**
 * Extracts the first 30 entries from an HN front page HTML.
 * HN structures each entry across two <tr> rows:
 *  - tr.athing: rank number + title
 *  - the immediately following <tr> ("subtext"): points + comments
 */
export function parseHNEntries(html: string): HNEntry[] {
  const $ = cheerio.load(html);
  const entries: HNEntry[] = [];

  $("tr.athing").each((_, row) => {
    const $row = $(row);
    const id = $row.attr("id");
    if (!id) return;

    const rank = parseInt($row.find("span.rank").text().replace(".", ""), 10);
    const title = $row.find("span.titleline > a").first().text().trim();

    const subtextRow = $row.next("tr");
    const points = parseInt(subtextRow.find(`#score_${id}`).text(), 10) || 0;

    // The last <a> in the subtext line is "N comments", "1 comment", or "discuss"
    const lastLink = subtextRow.find("span.subline a").last().text().trim();
    const comments = /discuss/i.test(lastLink) ? 0 : parseInt(lastLink, 10) || 0;

    if (!Number.isNaN(rank) && title) {
      entries.push({ rank, title, points, comments });
    }
  });

  return entries.slice(0, 30);
}