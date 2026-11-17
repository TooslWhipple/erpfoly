import { useCallback, useMemo, useState } from "react";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { getSupplierChargeCategories } from "@/services/supplierCharges.service";
import { registerDamagedGoodsExit, fetchSupplierDamagedGoods } from "@/services/supplierDamagedGoods.service";
import type {
  RegisterDamagedGoodsExitPayload,
  SupplierDamagedGoodsRow,
} from "@/types/supplierDashboard.types";

export function useSupplierDamagedGoods(
  supplierId: number | null,
  onBalanceChanged?: () => void
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

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    const selectableIds = items.filter((item) => item.status === "pending").map((item) => item.id);
    setSelectedIds((prev) => (prev.length === selectableIds.length ? [] : selectableIds));
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
    async (payload: Omit<RegisterDamagedGoodsExitPayload, "supplierId" | "damagedGoodsIds">) => {
      if (supplierId == null) {
        showError("Proveedor no válido.");
        return false;
      }

      setSaving(true);
      const result = await registerDamagedGoodsExit({
        ...payload,
        supplierId,
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
      onBalanceChanged?.();
      return true;
    },
    [supplierId, selectedIds, showError, showSuccess, onBalanceChanged]
  );

  return {
    items,
    loading,
    saving,
    fetchError,
    selectedIds,
    exitModalOpen,
    categories,
    toggleSelection,
    toggleSelectAll,
    openExitModal,
    closeExitModal,
    handleRegisterExit,
    refetchItems: loadItems,
  };
}
