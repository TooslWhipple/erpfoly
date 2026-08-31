import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/axios";
import {
  getSessionHistory,
  getSessionSummary,
  type CashMovement,
  type CashRegisterSummary,
} from "@/services/cash-register.service";
import {
  CASH_REGISTER_SESSION_HISTORY_KEY,
  CASH_REGISTER_SESSION_SUMMARY_KEY,
} from "@/lib/cashRegisterQueries";
import { useAuthStore } from "@/store/useAuthStore";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type { CashRegisterState } from "@/components/CashRegister";

interface UseCashRegisterSessionOptions {
  loadMovementsOnOpen?: boolean;
}

function mapSummaryToState(summary: CashRegisterSummary): CashRegisterState {
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
}

export function useCashRegisterSession(
  options: UseCashRegisterSessionOptions = {},
) {
  const { loadMovementsOnOpen = false } = options;
  const user = useAuthStore((state) => state.user);
  const showError = useSnackbarStore((state) => state.showError);
  const queryClient = useQueryClient();
  const lastErrorRef = useRef<unknown>(null);

  const summaryQuery = useQuery({
    queryKey: CASH_REGISTER_SESSION_SUMMARY_KEY,
    queryFn: async () => {
      try {
        return await getSessionSummary();
      } catch (err) {
        const message = getApiErrorMessage(err);
        if (message === "El usuario no tiene una caja asignada") {
          return null;
        }
        throw err;
      }
    },
    enabled: Boolean(user?.id),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const isOpen = summaryQuery.data?.status === "OPEN";

  const historyQuery = useQuery({
    queryKey: CASH_REGISTER_SESSION_HISTORY_KEY,
    queryFn: () => getSessionHistory(),
    enabled: Boolean(user?.id) && loadMovementsOnOpen && isOpen,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  useEffect(() => {
    if (!summaryQuery.isError || summaryQuery.error === lastErrorRef.current) {
      return;
    }
    lastErrorRef.current = summaryQuery.error;
    const message = getApiErrorMessage(summaryQuery.error);
    if (message !== "El usuario no tiene una caja asignada") {
      showError(message);
    }
  }, [summaryQuery.isError, summaryQuery.error, showError]);

  const cashRegister = useMemo(() => {
    if (summaryQuery.data == null) return null;
    return mapSummaryToState(summaryQuery.data);
  }, [summaryQuery.data]);

  const movements: CashMovement[] = historyQuery.data ?? [];

  const isLoading =
    summaryQuery.isLoading ||
    (loadMovementsOnOpen && isOpen && historyQuery.isLoading);

  const setCashRegister = useCallback(
    (
      updater:
        | CashRegisterState
        | null
        | ((prev: CashRegisterState | null) => CashRegisterState | null),
    ) => {
      queryClient.setQueryData(
        CASH_REGISTER_SESSION_SUMMARY_KEY,
        (prev: CashRegisterSummary | null | undefined) => {
          if (prev == null) return prev ?? null;
          const currentState = mapSummaryToState(prev);
          const next =
            typeof updater === "function" ? updater(currentState) : updater;
          if (next == null) return null;
          return {
            ...prev,
            status:
              next.status === "open" ? ("OPEN" as const) : ("CLOSED" as const),
            opening_balance: next.initialFund,
            exchange_rate: next.exchangeRate,
            current_cash: next.currentCash,
            limit: next.limit,
            cash_register_name: next.name,
            cash_register_id: Number(next.id),
            branch_id: next.branchId,
          };
        },
      );
    },
    [queryClient],
  );

  const loadAssignedCashRegister = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: CASH_REGISTER_SESSION_SUMMARY_KEY,
    });
    if (loadMovementsOnOpen) {
      await queryClient.invalidateQueries({
        queryKey: CASH_REGISTER_SESSION_HISTORY_KEY,
      });
    }
  }, [queryClient, loadMovementsOnOpen]);

  const loadMovements = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: CASH_REGISTER_SESSION_HISTORY_KEY,
    });
  }, [queryClient]);

  return {
    cashRegister,
    setCashRegister,
    movements,
    isLoading,
    loadAssignedCashRegister,
    loadMovements,
  };
}
