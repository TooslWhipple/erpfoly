import type { QueryClient } from "@tanstack/react-query";

export const CASH_REGISTER_SESSION_SUMMARY_KEY = [
  "cash-register-session-summary",
] as const;

export const CASH_REGISTER_SESSION_HISTORY_KEY = [
  "cash-register-session-history",
] as const;

/** @deprecated Prefer CASHIER_SALES_KEY; kept for prefix-compatible invalidation. */
export const PENDING_CASHIER_SALES_KEY = ["pending-cashier-sales"] as const;

export const CASHIER_SALES_KEY = ["cashier-sales"] as const;

/** Invalidates session summary, history, and cashier sales lists after a cobro. */
export function invalidateCashRegisterQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({
    queryKey: CASH_REGISTER_SESSION_SUMMARY_KEY,
  });
  void queryClient.invalidateQueries({
    queryKey: CASH_REGISTER_SESSION_HISTORY_KEY,
  });
  void queryClient.invalidateQueries({
    queryKey: CASHIER_SALES_KEY,
  });
  void queryClient.invalidateQueries({
    queryKey: PENDING_CASHIER_SALES_KEY,
  });
}
