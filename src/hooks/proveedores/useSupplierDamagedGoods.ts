import { useCallback, useMemo, useState } from "react";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { getSupplierChargeCategories } from "@/services/supplierCharges.service";
import { registerDamagedGoodsExit, fetchSupplierDamagedGoods } from "@/services/supplierDamagedGoods.service";
import type {
  RegisterSupplierChargePayload,
  SupplierAccountStatementRow,
  SupplierDamagedGoodsRow,
} from "@/types/supplierDashboard.types";

function formatAccountStatementLabel(periodLabel: string, isNext: boolean): string {
  const formatted = periodLabel.replace(/\s+(\d{4})$/, ", $1");
  return isNext ? `${formatted} (Siguiente)` : formatted;
}

export function useSupplierDamagedGoods(
  supplierId: number | null,
  accountStatements: SupplierAccountStatementRow[]
) {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [items, setItems] = useState<SupplierDamagedGoodsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [exitModalOpen, setExitModalOpen] = useState(false);

  const categories = useMemo(() => getSupplierChargeCategories(), []);

  const accountStatementOptions = useMemo(
    () =>
      accountStatements.map((statement, index) => ({
        value: statement.id,
        label: formatAccountStatementLabel(statement.periodLabel, index === 0),
      })),
    [accountStatements]
  );

  const loadItems = useCallback(async (isCancelled?: () => boolean) => {
    if (supplierId == null) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    const result = await fetchSupplierDamagedGoods(supplierId);
    if (isCancelled?.()) return;

    if (result.error) {
      setItems([]);
      setFetchError(result.error.message);
    } else {
      setItems(result.data ?? []);
    }

    if (!isCancelled?.()) {
      setLoading(false);
    }
  }, [supplierId]);

  useAsyncEffect(
    async (isCancelled) => {
      await loadItems(isCancelled);
    },
    [loadItems]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => (prev.length === items.length ? [] : items.map((item) => item.id)));
  }, [items]);

  const openExitModal = useCallback(() => {
    if (selectedIds.length === 0) {
      showError("Selecciona al menos un artículo.");
      return;
    }
    setExitModalOpen(true);
  }, [selectedIds.length, showError]);

  const closeExitModal = useCallback(() => {
    if (saving) return;
    setExitModalOpen(false);
  }, [saving]);

  const handleRegisterExit = useCallback(
    async (payload: Omit<RegisterSupplierChargePayload, "supplierId" | "chargedInLabel" | "categoryId">) => {
      if (supplierId == null) {
        showError("Proveedor no válido.");
        return false;
      }

      const selectedStatement = accountStatementOptions.find(
        (option) => option.value === payload.accountStatementId
      );
      const chargedInLabel =
        selectedStatement?.label.replace(" (Siguiente)", "") ?? "—";

      setSaving(true);
      const result = await registerDamagedGoodsExit({
        ...payload,
        supplierId,
        chargedInLabel,
        categoryId: "damaged_goods",
        damagedGoodsIds: selectedIds,
      });
      setSaving(false);

      if (result.error) {
        showError(result.error.message);
        return false;
      }

      setItems((prev) =>
        prev.map((row) =>
          result.data.updatedIds.includes(row.id)
            ? { ...row, status: "scheduled" }
            : row
        )
      );
      setSelectedIds([]);
      showSuccess("Salida registrada correctamente.");
      setExitModalOpen(false);
      return true;
    },
    [supplierId, accountStatementOptions, selectedIds, showError, showSuccess]
  );

  return {
    items,
    loading,
    saving,
    fetchError,
    selectedIds,
    exitModalOpen,
    categories,
    accountStatementOptions,
    toggleSelection,
    toggleSelectAll,
    openExitModal,
    closeExitModal,
    handleRegisterExit,
    refetchItems: loadItems,
  };
}
