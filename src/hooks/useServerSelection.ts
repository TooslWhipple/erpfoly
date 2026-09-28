import { useCallback, useMemo, useState } from "react";
import type { DelinquencyClientSelectionPayload } from "@/types/delinquency-shared-list.types";
import type { DelinquencyPeriod } from "@/types/delinquency.types";

export interface ServerSelectionPayload {
  clientIds?: number[];
  selection?: DelinquencyClientSelectionPayload;
}

interface UseServerSelectionOptions {
  resetKey: string;
  total: number;
  totalDebtAmount: number;
  period?: DelinquencyPeriod;
  search?: string;
}

const EMPTY_IDS = new Set<number>();
const EMPTY_DEBTS = new Map<number, number>();

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

function sumDebts(ids: Set<number>, debtById: Map<number, number>): number {
  let total = 0;
  for (const id of ids) {
    total += debtById.get(id) ?? 0;
  }
  return roundMoney(total);
}

export function useServerSelection({
  resetKey,
  total,
  totalDebtAmount,
  period,
  search,
}: UseServerSelectionOptions) {
  const [selectAll, setSelectAll] = useState(false);
  const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set());
  const [includedIds, setIncludedIds] = useState<Set<number>>(new Set());
  const [debtById, setDebtById] = useState<Map<number, number>>(new Map());
  const [appliedResetKey, setAppliedResetKey] = useState(resetKey);
  const isResetting = resetKey !== appliedResetKey;

  if (isResetting) {
    setAppliedResetKey(resetKey);
    setSelectAll(false);
    setExcludedIds(new Set());
    setIncludedIds(new Set());
    setDebtById(new Map());
  }

  const activeSelectAll = isResetting ? false : selectAll;
  const activeExcludedIds = isResetting ? EMPTY_IDS : excludedIds;
  const activeIncludedIds = isResetting ? EMPTY_IDS : includedIds;
  const activeDebtById = isResetting ? EMPTY_DEBTS : debtById;

  const rememberDebt = useCallback((id: number, debtAmount: number) => {
    setDebtById((prev) => {
      if (prev.get(id) === debtAmount) return prev;
      const next = new Map(prev);
      next.set(id, debtAmount);
      return next;
    });
  }, []);

  const isRowSelected = useCallback(
    (id: number) =>
      activeSelectAll ? !activeExcludedIds.has(id) : activeIncludedIds.has(id),
    [activeExcludedIds, activeIncludedIds, activeSelectAll],
  );

  const toggleRow = useCallback(
    (id: number, debtAmount: number) => {
      rememberDebt(id, debtAmount);
      if (activeSelectAll) {
        setExcludedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
        return;
      }

      setIncludedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [activeSelectAll, rememberDebt],
  );

  const isAllSelected = activeSelectAll && activeExcludedIds.size === 0;
  const isIndeterminate =
    (activeSelectAll && activeExcludedIds.size > 0) ||
    (!activeSelectAll && activeIncludedIds.size > 0);

  const toggleAll = useCallback(() => {
    if (activeSelectAll && activeExcludedIds.size === 0) {
      setSelectAll(false);
      setExcludedIds(new Set());
      setIncludedIds(new Set());
      return;
    }

    setSelectAll(true);
    setExcludedIds(new Set());
    setIncludedIds(new Set());
  }, [activeExcludedIds.size, activeSelectAll]);

  const selectedCount = activeSelectAll
    ? Math.max(0, total - activeExcludedIds.size)
    : activeIncludedIds.size;

  const selectedDebt = activeSelectAll
    ? roundMoney(totalDebtAmount - sumDebts(activeExcludedIds, activeDebtById))
    : sumDebts(activeIncludedIds, activeDebtById);

  const payload = useMemo<ServerSelectionPayload>(() => {
    if (activeSelectAll) {
      return {
        selection: {
          selectAll: true,
          period,
          search: search || undefined,
          excludedClientIds: [...activeExcludedIds],
        },
      };
    }

    return { clientIds: [...activeIncludedIds] };
  }, [activeExcludedIds, activeIncludedIds, activeSelectAll, period, search]);

  return {
    isRowSelected,
    toggleRow,
    toggleAll,
    isAllSelected,
    isIndeterminate,
    selectedCount,
    selectedDebt,
    payload,
  };
}
