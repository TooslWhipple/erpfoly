export const CASH_REGISTER_HISTORY_PATH = "/cajas/historial";

export const CASH_REGISTER_SEARCH_QUERY_KEY = "q";

export function buildCashRegisterSearchUrl(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return "/cajas";

  const params = new URLSearchParams({
    [CASH_REGISTER_SEARCH_QUERY_KEY]: trimmed,
  });

  return `/cajas/busqueda?${params.toString()}`;
}

export function getCashRegisterSearchQuery(
  query: Record<string, string | string[] | undefined>,
): string {
  const value = query[CASH_REGISTER_SEARCH_QUERY_KEY];
  return typeof value === "string" ? value : "";
}
