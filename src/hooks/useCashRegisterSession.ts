import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/axios";
import {
  getSessionHistory,
  getSessionSummary,
  type CashMovement,
} from "@/services/cash-register.service";
import { useAuthStore } from "@/store/useAuthStore";
import type { CashRegisterState } from "@/components/CashRegister";

const SUMMARY_KEY = "cash-session-summary";
const HISTORY_KEY = "cash-session-history";

interface UseCashRegisterSessionOptions {
  loadMovementsOnOpen?: boolean;
}

export function useCashRegisterSession(
  options: UseCashRegisterSessionOptions = {},
) {
  const { loadMovementsOnOpen = false } = options;
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: [SUMMARY_KEY, user?.id],
    enabled: Boolean(user?.id),
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<CashRegisterState | null> => {
      try {
        const summary = await getSessionSummary();
        return {
          id: String(summary.cash_register_id),
          name: summary.cash_register_name,
          status: summary.status === "OPEN" ? "open" : "closed",
          initialFund: summary.opening_balance ?? 0,
          exchangeRate: summary.exchange_rate ?? 17.6,
          currentCash: summary.current_cash ?? 0,
          limit: summary.limit ?? 20000,
          branchId: summary.branch_id,
        };
      } catch (err) {
        const message = getApiErrorMessage(err);
        if (message === "El usuario no tiene una caja asignada") {
          return null;
        }
        throw err;
      }
    },
  });

  const isOpen = summaryQuery.data?.status === "open";

  const historyQuery = useQuery({
    queryKey: [HISTORY_KEY, user?.id],
    enabled: Boolean(user?.id) && loadMovementsOnOpen && isOpen,
    refetchOnWindowFocus: true,
    queryFn: () => getSessionHistory(),
  });

  const loadAssignedCashRegister = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [SUMMARY_KEY] });
    await queryClient.invalidateQueries({ queryKey: [HISTORY_KEY] });
  }, [queryClient]);

  const loadMovements = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [HISTORY_KEY] });
  }, [queryClient]);

  const setCashRegister = useCallback(
    (
      value:
        | CashRegisterState
        | null
        | ((prev: CashRegisterState | null) => CashRegisterState | null),
    ) => {
      queryClient.setQueryData(
        [SUMMARY_KEY, user?.id],
        typeof value === "function"
          ? value(summaryQuery.data ?? null)
          : value,
      );
    },
    [queryClient, summaryQuery.data, user?.id],
  );

  return {
    cashRegister: summaryQuery.data ?? null,
    setCashRegister,
    movements: (historyQuery.data ?? []) as CashMovement[],
    isLoading: summaryQuery.isLoading,
    loadAssignedCashRegister,
    loadMovements,
  };
}
