import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  cancelSupplierPayment,
  editSupplierPayment,
  executeSupplierPayment,
  fetchSupplierPayments,
  registerSupplierPayment,
  scheduleSupplierPayment,
  uploadPaymentReceipt,
} from "@/services/supplierPayments.service";
import type {
  EditSupplierPaymentPayload,
  RegisterSupplierPaymentPayload,
  ScheduleSupplierPaymentPayload,
  SupplierPaymentRow,
} from "@/types/supplierDashboard.types";

export type PaymentModalMode = "schedule" | "register" | "edit";

export function useSupplierPayments(
  supplierId: number | null,
  onBalanceChanged?: () => void
) {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [payments, setPayments] = useState<SupplierPaymentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<PaymentModalMode | null>(null);
  const [editingPayment, setEditingPayment] = useState<SupplierPaymentRow | null>(null);

  const loadPayments = useCallback(async (isCancelled?: () => boolean) => {
    if (supplierId == null) {
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    const result = await fetchSupplierPayments(supplierId);
    if (isCancelled?.()) return;

    if (result.error) {
      setPayments([]);
      setFetchError(result.error.message);
    } else {
      setPayments(result.data ?? []);
    }

    if (!isCancelled?.()) {
      setLoading(false);
    }
  }, [supplierId]);

  useAsyncEffect(
    async (isCancelled) => {
      await loadPayments(isCancelled);
    },
    [loadPayments]
  );

  const openScheduleModal = useCallback(() => {
    setEditingPayment(null);
    setModalMode("schedule");
  }, []);

  const openRegisterModal = useCallback(() => {
    setEditingPayment(null);
    setModalMode("register");
  }, []);

  const openEditModal = useCallback((payment: SupplierPaymentRow) => {
    setEditingPayment(payment);
    setModalMode("edit");
  }, []);

  const closeModal = useCallback(() => {
    if (saving) return;
    setModalMode(null);
    setEditingPayment(null);
  }, [saving]);

  const handleSchedulePayment = useCallback(
    async (payload: ScheduleSupplierPaymentPayload) => {
      if (supplierId == null) {
        showError("Proveedor no válido.");
        return false;
      }
      setSaving(true);
      const result = await scheduleSupplierPayment(supplierId, payload);
      setSaving(false);

      if (result.error) {
        showError(result.error.message);
        return false;
      }

      setPayments((prev) => [result.data, ...prev]);
      showSuccess("Pago programado correctamente.");
      setModalMode(null);
      return true;
    },
    [supplierId, showError, showSuccess]
  );

  const handleRegisterPayment = useCallback(
    async (payload: RegisterSupplierPaymentPayload) => {
      if (supplierId == null) {
        showError("Proveedor no válido.");
        return false;
      }
      setSaving(true);
      const result = await registerSupplierPayment(supplierId, payload);
      setSaving(false);

      if (result.error) {
        showError(result.error.message);
        return false;
      }

      setPayments((prev) => [result.data, ...prev]);
      showSuccess("Pago registrado correctamente.");
      setModalMode(null);
      onBalanceChanged?.();
      return true;
    },
    [supplierId, showError, showSuccess, onBalanceChanged]
  );

  const handleEditPayment = useCallback(
    async (paymentId: number, payload: EditSupplierPaymentPayload) => {
      if (supplierId == null) {
        showError("Proveedor no válido.");
        return false;
      }
      setSaving(true);
      const result = await editSupplierPayment(supplierId, paymentId, payload);
      setSaving(false);

      if (result.error) {
        showError(result.error.message);
        return false;
      }

      setPayments((prev) => prev.map((p) => (p.id === paymentId ? result.data : p)));
      showSuccess("Pago actualizado correctamente.");
      setModalMode(null);
      setEditingPayment(null);
      return true;
    },
    [supplierId, showError, showSuccess]
  );

  const handleExecutePayment = useCallback(
    async (paymentId: number) => {
      if (supplierId == null) {
        showError("Proveedor no válido.");
        return;
      }
      setSaving(true);
      const result = await executeSupplierPayment(supplierId, paymentId);
      setSaving(false);

      if (result.error) {
        showError(result.error.message);
        return;
      }

      setPayments((prev) => prev.map((p) => (p.id === paymentId ? result.data : p)));
      showSuccess("Pago ejecutado correctamente.");
      onBalanceChanged?.();
    },
    [supplierId, showError, showSuccess, onBalanceChanged]
  );

  const handleCancelPayment = useCallback(
    async (paymentId: number) => {
      if (supplierId == null) {
        showError("Proveedor no válido.");
        return;
      }
      setSaving(true);
      const result = await cancelSupplierPayment(supplierId, paymentId);
      setSaving(false);

      if (result.error) {
        showError(result.error.message);
        return;
      }

      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      showSuccess("Pago cancelado correctamente.");
    },
    [supplierId, showError, showSuccess]
  );

  const handleUploadReceipt = useCallback(
    async (paymentId: number, file: File) => {
      if (supplierId == null) {
        showError("Proveedor no válido.");
        return;
      }
      setSaving(true);
      const result = await uploadPaymentReceipt(supplierId, paymentId, file);
      setSaving(false);

      if (result.error) {
        showError(result.error.message);
        return;
      }

      setPayments((prev) => prev.map((p) => (p.id === paymentId ? result.data : p)));
      showSuccess("Comprobante subido correctamente.");
    },
    [supplierId, showError, showSuccess]
  );

  return {
    payments,
    loading,
    saving,
    fetchError,
    modalMode,
    editingPayment,
    openScheduleModal,
    openRegisterModal,
    openEditModal,
    closeModal,
    handleSchedulePayment,
    handleRegisterPayment,
    handleEditPayment,
    handleExecutePayment,
    handleCancelPayment,
    handleUploadReceipt,
    refetchPayments: loadPayments,
  };
}
