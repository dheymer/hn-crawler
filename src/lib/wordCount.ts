/**
 * Counts words in a title using a simple, deterministic rule:
 * split on whitespace, then discard any token that has no letters or
 * digits at all (pure punctuation/symbol tokens, e.g. a lone "-" or "&").
 *
 * Hyphenated compounds like "self-explained" are NOT split — they remain
 * a single token and count as one word, matching the example from the spec:
 * "This is - a self-explained example" -> 5 words
 * (tokens: This, is, -, a, self-explained, example -> "-" is discarded).
 */
export function countWords(title: string): number {
  const trimmed = title.trim();
  if (!trimmed) return 0;

  return trimmed
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}