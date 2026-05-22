/**
 * Build a deterministic cache key for AI-generated reviews.
 * This ensures identical requests return cached results.
 */
export function buildCacheKey(
  businessName: string,
  rating: number,
  tags: string[],
  tone: string,
  language: string
): string {
  const tagsSorted = [...tags].sort().join(",");
  return `prompt:${businessName}:${rating}:${tagsSorted}:${tone}:${language}`;
}
