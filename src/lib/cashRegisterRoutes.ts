import type { CashSearchMode } from "@/components/CashRegister";

export const CASH_REGISTER_HISTORY_PATH = "/cajas/historial";

export const CASH_REGISTER_SEARCH_QUERY_KEY = "q";
export const CASH_REGISTER_MODE_QUERY_KEY = "mode";

export function buildCashRegisterSearchUrl(
  query: string,
  mode: CashSearchMode = "abonos",
): string {
  const trimmed = query.trim();
  if (!trimmed) return "/cajas";

  const params = new URLSearchParams({
    [CASH_REGISTER_SEARCH_QUERY_KEY]: trimmed,
    [CASH_REGISTER_MODE_QUERY_KEY]: mode,
  });

  return `/cajas/busqueda?${params.toString()}`;
}

export function getCashRegisterSearchQuery(
  query: Record<string, string | string[] | undefined>,
): string {
  const value = query[CASH_REGISTER_SEARCH_QUERY_KEY];
  return typeof value === "string" ? value : "";
}

export function getCashRegisterSearchMode(
  query: Record<string, string | string[] | undefined>,
): CashSearchMode {
  const value = query[CASH_REGISTER_MODE_QUERY_KEY];
  return value === "ventas" ? "ventas" : "abonos";
}
