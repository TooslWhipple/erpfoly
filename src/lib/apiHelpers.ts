/**
 * Reusable helpers for building list/paginated API query strings and URLs.
 * Use with any service that powers usePaginatedList or similar list endpoints.
 */

/**
 * Builds a query string from list params. Only includes defined, non-null values
 * that are string, number, or boolean; search is trimmed and omitted when empty.
 * Accepts any object so service-specific param types (e.g. GetProductLinesParams)
 * work without index signatures.
 */
export function buildListQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") continue;
    if (key === "search") {
      const trimmed = typeof value === "string" ? value.trim() : String(value).trim();
      if (!trimmed) continue;
      searchParams.set(key, trimmed);
      continue;
    }
    searchParams.set(key, String(value));
  }
  return searchParams.toString();
}

/**
 * Returns the full list URL: basePath or basePath?query when there are params.
 * Accepts any object (e.g. GetProductLinesParams, GetDepartmentsParams).
 */
export function buildListUrl<T extends object>(basePath: string, params: T): string {
  const query = buildListQueryString(params as Record<string, unknown>);
  return query ? `${basePath}?${query}` : basePath;
}
