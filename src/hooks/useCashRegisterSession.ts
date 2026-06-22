import { useState, useCallback, useEffect } from "react";
import { getApiErrorMessage } from "@/lib/axios";
import {
  getSessionHistory,
  getSessionSummary,
  type CashMovement,
} from "@/services/cash-register.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type { CashRegisterState } from "@/components/CashRegister";

interface UseCashRegisterSessionOptions {
  loadMovementsOnOpen?: boolean;
}

export function useCashRegisterSession(
  options: UseCashRegisterSessionOptions = {},
) {
  const { loadMovementsOnOpen = false } = options;
  const user = useAuthStore((state) => state.user);
  const showError = useSnackbarStore((state) => state.showError);

  const [cashRegister, setCashRegister] = useState<CashRegisterState | null>(null);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMovements = useCallback(async () => {
    try {
      const history = await getSessionHistory();
      setMovements(history);
    } catch {
      // History is optional for the dashboard
    }
  }, []);

  const loadAssignedCashRegister = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const summary = await getSessionSummary();
      if (!summary) {
        showError("No tienes una caja asignada. Contacta a un administrador.");
        setCashRegister(null);
        return;
      }

      setCashRegister({
        id: String(summary.cash_register_id),
        name: summary.cash_register_name,
        status: summary.status === "OPEN" ? "open" : "closed",
        initialFund: summary.opening_balance ?? 0,
        exchangeRate: summary.exchange_rate ?? 17.6,
        currentCash: summary.current_cash ?? 0,
        limit: summary.limit ?? 20000,
      });

      if (loadMovementsOnOpen && summary.status === "OPEN") {
        await loadMovements();
      }
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, showError, loadMovementsOnOpen, loadMovements]);

  useEffect(() => {
    void loadAssignedCashRegister();
  }, [loadAssignedCashRegister]);

  return {
    cashRegister,
    setCashRegister,
    movements,
    isLoading,
    loadAssignedCashRegister,
    loadMovements,
  };
}
