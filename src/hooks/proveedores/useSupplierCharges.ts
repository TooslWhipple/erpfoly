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
  SupplierAccountStatementRow,
  SupplierChargeRow,
} from "@/types/supplierDashboard.types";
import dayjs from "@/lib/dayjs";

function formatAccountStatementLabel(month: number, year: number, isNext: boolean): string {
  const formatted = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).format("MMMM YYYY");
  return isNext ? `${formatted} (Siguiente)` : formatted;
}

export function useSupplierCharges(
  supplierId: number | null,
  accountStatements: SupplierAccountStatementRow[]
) {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [charges, setCharges] = useState<SupplierChargeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const categories = useMemo(() => getSupplierChargeCategories(), []);

  const accountStatementOptions = useMemo(
    () =>
      accountStatements.map((statement, index) => ({
        value: statement.id,
        label: formatAccountStatementLabel(statement.periodMonth, statement.periodYear, index === 0),
      })),
    [accountStatements]
  );

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
    async (payload: Omit<RegisterSupplierChargePayload, "supplierId" | "chargedInLabel">) => {
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
      const result = await registerSupplierCharge({
        ...payload,
        supplierId,
        chargedInLabel,
      });
      setSaving(false);

      if (result.error) {
        showError(result.error.message);
        return false;
      }

      setCharges((prev) => [result.data, ...prev]);
      showSuccess("Cargo registrado correctamente.");
      setModalOpen(false);
      return true;
    },
    [supplierId, accountStatementOptions, showError, showSuccess]
  );

  return {
    charges,
    loading,
    saving,
    modalOpen,
    fetchError,
    categories,
    accountStatementOptions,
    openRegisterModal,
    closeRegisterModal,
    handleRegisterCharge,
    refetchCharges: loadCharges,
  };
}
