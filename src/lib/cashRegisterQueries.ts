import type { QueryClient } from "@tanstack/react-query";

export const CASH_REGISTER_SESSION_SUMMARY_KEY = [
  "cash-register-session-summary",
] as const;

export const CASH_REGISTER_SESSION_HISTORY_KEY = [
  "cash-register-session-history",
] as const;

export const PENDING_CASHIER_SALES_KEY = ["pending-cashier-sales"] as const;

/** Invalidates session summary, history, and pending cashier sales after a cobro. */
export function invalidateCashRegisterQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({
    queryKey: CASH_REGISTER_SESSION_SUMMARY_KEY,
  });
  void queryClient.invalidateQueries({
    queryKey: CASH_REGISTER_SESSION_HISTORY_KEY,
  });
  void queryClient.invalidateQueries({
    queryKey: PENDING_CASHIER_SALES_KEY,
  });
}
