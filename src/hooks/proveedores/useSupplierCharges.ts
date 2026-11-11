import { useCallback, useMemo, useState } from "react";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  fetchSupplierCharges,
  getSupplierChargeCategories,
  registerSupplierCharge,
} from "@/services/supplierCharges.service";
import type {
  RegisterSupplierChargePayload,
  SupplierChargeRow,
} from "@/types/supplierDashboard.types";

export function useSupplierCharges(
  supplierId: number | null,
  onBalanceChanged?: () => void
) {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [charges, setCharges] = useState<SupplierChargeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const categories = useMemo(() => getSupplierChargeCategories(), []);

  const loadCharges = useCallback(async (isCancelled?: () => boolean) => {
    if (supplierId == null) {
      setCharges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    const result = await fetchSupplierCharges(supplierId);
    if (isCancelled?.()) return;

    if (result.error) {
      setCharges([]);
      setFetchError(result.error.message);
    } else {
      setCharges(result.data ?? []);
    }

    if (!isCancelled?.()) {
      setLoading(false);
    }
  }, [supplierId]);

  useAsyncEffect(
    async (isCancelled) => {
      await loadCharges(isCancelled);
    },
    [loadCharges]
  );

  const openRegisterModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closeRegisterModal = useCallback(() => {
    if (saving) return;
    setModalOpen(false);
  }, [saving]);

  const handleRegisterCharge = useCallback(
    async (payload: Omit<RegisterSupplierChargePayload, "supplierId">) => {
      if (supplierId == null) {
        showError("Proveedor no válido.");
        return false;
      }

      setSaving(true);
      const result = await registerSupplierCharge({
        ...payload,
        supplierId,
      });
      setSaving(false);

      if (result.error) {
        showError(result.error.message);
        return false;
      }

      setCharges((prev) => [result.data, ...prev]);
      showSuccess("Cargo registrado correctamente.");
      setModalOpen(false);
      onBalanceChanged?.();
      return true;
    },
    [supplierId, showError, showSuccess, onBalanceChanged]
  );

  return {
    charges,
    loading,
    saving,
    modalOpen,
    fetchError,
    categories,
    openRegisterModal,
    closeRegisterModal,
    handleRegisterCharge,
    refetchCharges: loadCharges,
  };
}
