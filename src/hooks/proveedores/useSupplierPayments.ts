import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { fetchSupplierPaymentsMock } from "@/services/supplierPayments.service";
import type { SupplierPaymentRow } from "@/types/supplierDashboard.types";

export function useSupplierPayments(supplierId: number | null) {
  const [payments, setPayments] = useState<SupplierPaymentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadPayments = useCallback(async (isCancelled?: () => boolean) => {
    if (supplierId == null) {
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    const result = await fetchSupplierPaymentsMock(supplierId);
    if (isCancelled?.()) return;

    if (result.error) {
      setPayments([]);
      setFetchError(result.error.message);
    } else {
      setPayments(result.data);
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

  return {
    payments,
    loading,
    fetchError,
    refetchPayments: loadPayments,
  };
}
