import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getClientPurchaseDetail } from "@/data/clientPurchases.mockData";
import type { ClientPurchaseDetail } from "@/types/clientPurchase.types";

interface UseClientPurchaseDetailResult {
  routerReady: boolean;
  clientId: string | null;
  purchaseId: string | null;
  purchase: ClientPurchaseDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useClientPurchaseDetail(): UseClientPurchaseDetailResult {
  const router = useRouter();
  const { id, purchaseId } = router.query;

  const [purchase, setPurchase] = useState<ClientPurchaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const routerReady = router.isReady;
  const clientId = typeof id === "string" ? id : null;
  const resolvedPurchaseId = typeof purchaseId === "string" ? purchaseId : null;

  const fetchPurchase = useCallback(async () => {
    if (!clientId || !resolvedPurchaseId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getClientPurchaseDetail(clientId, resolvedPurchaseId);
      if (!data) {
        setPurchase(null);
        setError("Compra no encontrada");
        return;
      }
      setPurchase(data);
    } catch (err) {
      console.error("[useClientPurchaseDetail] Error loading purchase:", err);
      setPurchase(null);
      setError("Error al cargar la compra");
    } finally {
      setLoading(false);
    }
  }, [clientId, resolvedPurchaseId]);

  useEffect(() => {
    if (!routerReady) return;
    if (!clientId || !resolvedPurchaseId) {
      setLoading(false);
      return;
    }
    void fetchPurchase();
  }, [routerReady, clientId, resolvedPurchaseId, fetchPurchase]);

  return {
    routerReady,
    clientId,
    purchaseId: resolvedPurchaseId,
    purchase,
    loading,
    error,
    refetch: fetchPurchase,
  };
}
