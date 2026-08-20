import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getClientPurchaseDetail } from "@/services/clients.service";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import { formatDate, formatDateOnly } from "@/utils/date";
import type {
  ClientPurchaseDetail,
  ClientPurchaseDetailApi,
} from "@/types/clientPurchase.types";

interface UseClientPurchaseDetailResult {
  routerReady: boolean;
  clientId: string | null;
  purchaseId: string | null;
  purchase: ClientPurchaseDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function parsePositiveInt(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function mapPurchaseDetail(data: ClientPurchaseDetailApi): ClientPurchaseDetail {
  const isCancelled = data.status === "CANCELADA";

  return {
    id: String(data.id),
    reference: data.reference,
    productSku: data.productSku,
    productImageUrl: data.productImageUrl,
    clientId: String(data.clientId),
    clientName: data.clientName,
    productName: data.productName,
    purchaseDateLabel: formatDate(data.purchaseDate, "D [de] MMMM, YYYY"),
    status: data.status,
    initialCost: data.initialCost,
    totalPaid: data.totalPaid,
    remaining: data.remaining,
    paymentDueDate: isCancelled
      ? "N/A"
      : data.paymentDueDate
        ? formatDate(data.paymentDueDate, "D [de] MMM")
        : "—",
    highlightPaymentDueDate: !isCancelled && data.remaining > 0,
    nextPaymentAmount: data.nextPaymentAmount,
    paidInstallments: data.paidInstallments,
    totalInstallments: data.totalInstallments,
    canCancel: data.canCancel,
    cancelBlockReason: data.cancelBlockReason,
    payments: data.payments.map((payment) => ({
      id: String(payment.id),
      status: payment.status,
      installmentLabel: payment.installmentLabel,
      dueDate: formatDateOnly(payment.dueDate, "D [de] MMM"),
      amount: payment.amount,
    })),
    purchaseInfo: {
      purchaseDate: formatDate(data.purchaseInfo.purchaseDate, "dateLong"),
      deliveryDate: data.purchaseInfo.deliveryDate
        ? formatDateOnly(data.purchaseInfo.deliveryDate, "dateLong")
        : "—",
      purchaseBranch: data.purchaseInfo.purchaseBranch,
      deliveryBranch: data.purchaseInfo.deliveryBranch ?? "—",
    },
  };
}

export function useClientPurchaseDetail(): UseClientPurchaseDetailResult {
  const router = useRouter();
  const { id, purchaseId } = router.query;

  const routerReady = router.isReady;
  const clientId = typeof id === "string" ? id : null;
  const resolvedPurchaseId = typeof purchaseId === "string" ? purchaseId : null;
  const numericClientId = parsePositiveInt(clientId);
  const numericSaleId = parsePositiveInt(resolvedPurchaseId);
  const idsReady = numericClientId !== null && numericSaleId !== null;

  const query = useQuery({
    queryKey: ["clients", "purchase-detail", numericClientId, numericSaleId],
    enabled: routerReady && idsReady,
    queryFn: async () => {
      const result = await getClientPurchaseDetail(
        numericClientId as number,
        numericSaleId as number,
      );
      return mapPurchaseDetail(unwrapOrThrow(result));
    },
  });

  const invalidIds = routerReady && !idsReady;

  return {
    routerReady,
    clientId,
    purchaseId: resolvedPurchaseId,
    purchase: query.data ?? null,
    loading: !routerReady || (idsReady && query.isPending),
    error: invalidIds
      ? "Compra no encontrada"
      : query.isError
        ? getApiErrorMessage(query.error)
        : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
