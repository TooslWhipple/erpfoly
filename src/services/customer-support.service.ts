import { get, post, patch } from "@/lib/axios";
import { unwrapOrThrow } from "@/lib/axios";
import type { ApiResult } from "@/lib/axios";
import { getClients } from "@/services/clients.service";
import {
  cancelClientPurchase,
  getClientPurchaseDetail,
} from "@/services/clients.service";
import { getSaleDetail, getSales } from "@/services/ventas.service";
import { formatDateOnly } from "@/utils/date";
import type {
  ArticleStatus,
  InvoiceActivity,
  InvoiceArticle,
  InvoiceDetail,
  InvoicePaymentType,
  InvoiceStatus,
  SearchResult,
  SearchType,
} from "@/types/atencion-cliente.types";
import type {
  SaleDetail,
  SaleListItem,
  SalePaymentType,
  SaleStatus,
} from "@/types/ventas.types";
import { SALE_STATUS_CHIP_LABELS } from "@/utils/saleStatus";

export type CustomerSupportSearchResult = SearchResult & {
  saleId?: number;
  clientId?: number;
  amount?: number;
  dateLabel?: string;
  status?: SaleStatus;
  paymentType?: SalePaymentType;
  phone?: string;
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  LOYALTY_POINTS: "Foly Puntos",
  MIXED: "Mixto",
};

function paymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method] ?? "Otro método";
}

function saleStatusLabel(status: string): string {
  return SALE_STATUS_CHIP_LABELS[status as SaleStatus] ?? "Actualizado";
}

function mapSaleStatus(status: string): InvoiceStatus {
  if (status === "CANCELLED") return "cancelado";
  if (status === "PAID" || status === "DELIVERED") return "pagado";
  return "activo";
}

function mapPaymentType(code: string | null): InvoicePaymentType {
  if (code === "CREDIT") return "credito";
  if (code === "LAYAWAY") return "apartado";
  return "contado";
}

function mapArticleStatus(args: {
  cancelledAt?: string | null;
  saleStatus: string;
  deliveryStatus?: string | null;
  serviceOrderId?: string;
  recoverySheetId?: string;
  recoverySheetStatus?: string | null;
}): ArticleStatus {
  if (args.cancelledAt) return "cancelado";
  if (args.recoverySheetStatus === "recuperada") return "recuperado";
  if (args.recoverySheetId) return "esperando_recuperacion";
  if (args.serviceOrderId) return "reparacion";
  if (args.deliveryStatus === "DELIVERED" || args.saleStatus === "DELIVERED") {
    return "entregado";
  }
  return "pendiente";
}

function saleToSearchResult(sale: SaleListItem): CustomerSupportSearchResult {
  const dateLabel = formatDateOnly(sale.createdAt, "dateLong");
  return {
    id: String(sale.id),
    type: "facturas",
    title: `Factura ${sale.folio}`,
    subtitle: sale.clientName ?? "Sin cliente",
    metadata: {
      date: dateLabel,
      amount: String(sale.totalAmount),
    },
    saleId: sale.id,
    amount: sale.totalAmount,
    dateLabel,
    status: sale.status,
    paymentType: sale.paymentType,
  };
}

export async function searchCustomerSupport(
  query: string,
  type: SearchType,
): Promise<CustomerSupportSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (type === "pedidos") {
    return [];
  }

  if (type === "clientes") {
    const clients = await unwrapOrThrow(
      await getClients({ page: 1, limit: 20, search: trimmed }),
    );
    return clients.rows.map((client) => ({
      id: String(client.id),
      type: "clientes" as const,
      title: client.fullName,
      subtitle: client.phoneNumber
        ? `Tel. ${client.phoneNumber}`
        : "Sin teléfono registrado",
      clientId: client.id,
      phone: client.phoneNumber ?? undefined,
    }));
  }

  const sales = await unwrapOrThrow(
    await getSales({ page: 1, limit: 20, search: trimmed }),
  );
  return sales.rows.map(saleToSearchResult);
}

export async function searchSalesForClient(
  clientId: number,
): Promise<CustomerSupportSearchResult[]> {
  const sales = await unwrapOrThrow(
    await getSales({ page: 1, limit: 50, client_id: clientId }),
  );
  return sales.rows.map(saleToSearchResult);
}

type ServiceOrderListItem = {
  id: string;
  folio?: string;
  title?: string;
  status?: string;
  generatedAt?: string;
  instructionsAppliedAt?: string | null;
  solvedAt?: string | null;
  queja: { articleId: string };
  recoverySheetId?: string | null;
  recoverySheetStatus?: string | null;
};

async function loadOrdersForSale(saleId: number): Promise<ServiceOrderListItem[]> {
  const result = await get<ServiceOrderListItem[] | ServiceOrderListItem>(
    `/service-orders/by-sale/${saleId}`,
  );
  if (result.error || result.data == null) return [];
  return Array.isArray(result.data) ? result.data : [result.data];
}

export async function getInvoiceDetail(
  invoiceId: string,
): Promise<InvoiceDetail> {
  const saleId = Number(invoiceId);
  if (!Number.isFinite(saleId)) {
    throw new Error("Factura no encontrada");
  }
  const sale = await unwrapOrThrow(await getSaleDetail(saleId));
  return mapSaleToInvoice(sale);
}

export async function mapSaleToInvoice(
  sale: SaleDetail,
): Promise<InvoiceDetail> {
  const orders = await loadOrdersForSale(sale.id);
  const orderByItem = new Map(
    orders.map((order) => [order.queja.articleId, order]),
  );

  let remaining = 0;
  let totalPayments = 0;
  let paymentDate = "—";
  let nextPayment = 0;
  let currentPayment = 0;
  let totalPaymentsCount = 0;
  let canCancel = false;
  let cancelBlockReason: string | null = null;

  if (sale.client && sale.credit) {
    try {
      const purchase = await unwrapOrThrow(
        await getClientPurchaseDetail(sale.client.id, sale.id),
      );
      remaining = purchase.remaining;
      totalPayments = purchase.totalPaid;
      paymentDate = purchase.paymentDueDate
        ? formatDateOnly(purchase.paymentDueDate, "dateLong")
        : "—";
      nextPayment = purchase.nextPaymentAmount;
      currentPayment = purchase.paidInstallments;
      totalPaymentsCount = purchase.totalInstallments;
      canCancel = purchase.canCancel;
      cancelBlockReason = purchase.cancelBlockReason;
    } catch {
      remaining = sale.totalAmount;
      totalPayments = sale.payments.reduce((sum, row) => sum + row.amount, 0);
    }
  } else {
    totalPayments = sale.payments.reduce((sum, row) => sum + row.amount, 0);
    remaining = Math.max(0, sale.totalAmount - totalPayments);
    canCancel = sale.status !== "CANCELLED" && sale.status !== "DELIVERED";
  }

  const articles: InvoiceArticle[] = sale.items.map((item) => {
    const order = orderByItem.get(String(item.id));
    return {
      id: String(item.id),
      code: item.product.code,
      status: mapArticleStatus({
        cancelledAt: item.cancelledAt,
        saleStatus: sale.status,
        deliveryStatus: sale.deliveryStatus,
        serviceOrderId: order?.id,
        recoverySheetId: order?.recoverySheetId ?? undefined,
        recoverySheetStatus: order?.recoverySheetStatus,
      }),
      description: item.product.name,
      price: item.unitPrice,
      promotions: item.discountAmount,
      total: item.totalAmount,
      points: 0,
      quantity: item.quantity,
      productId: item.product.id,
      serviceOrderId: order?.id,
      recoverySheetId: order?.recoverySheetId ?? undefined,
      hasRecoveryOrder: Boolean(order?.recoverySheetId),
    };
  });

  const activities: InvoiceActivity[] = [
    ...(sale.statusHistory ?? []).map((row) => {
      const label = saleStatusLabel(row.newStatus);
      const previous = row.previousStatus
        ? saleStatusLabel(row.previousStatus)
        : null;
      return {
        id: `status-${row.id}`,
        date: row.createdAt,
        type: "status_change" as const,
        title: label,
        description: row.comments
          ? row.comments
          : previous
            ? `Cambio desde ${previous}`
            : undefined,
      };
    }),
    ...sale.payments.map((row) => ({
      id: `pay-${row.id}`,
      date: row.createdAt ?? sale.createdAt,
      type: "payment" as const,
      title: "Pago registrado",
      description: paymentMethodLabel(row.paymentMethod),
      amount: row.amount,
    })),
    ...orders.flatMap((order) => {
      const folio = order.folio ?? `OS-${order.id}`;
      const events: InvoiceActivity[] = [
        {
          id: `os-create-${order.id}`,
          date: order.generatedAt ?? sale.createdAt,
          type: "note" as const,
          title: "Orden de servicio creada",
          description: order.title ? `${folio} · ${order.title}` : folio,
        },
      ];
      if (order.instructionsAppliedAt) {
        events.push({
          id: `os-apply-${order.id}`,
          date: order.instructionsAppliedAt,
          type: "note" as const,
          title: "Indicaciones aplicadas",
          description: folio,
        });
      }
      if (order.solvedAt) {
        events.push({
          id: `os-close-${order.id}`,
          date: order.solvedAt,
          type: "note" as const,
          title: "Orden de servicio cerrada",
          description: folio,
        });
      }
      return events;
    }),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  return {
    id: String(sale.id),
    invoiceNumber: sale.folio,
    customerId: sale.client ? String(sale.client.id) : "",
    customerName: sale.client?.fullName ?? "Sin cliente",
    customerPhone: sale.client?.phoneNumber ?? "",
    customerAddress:
      sale.deliveryAddressFormatted ??
      sale.client?.primaryAddress?.formatted ??
      "",
    purchaseDate: formatDateOnly(sale.createdAt, "dateLong"),
    paymentType: mapPaymentType(sale.purchaseType),
    status: mapSaleStatus(sale.status),
    initialCost: sale.totalAmount,
    totalPayments,
    remaining,
    paymentDate,
    nextPayment,
    currentPayment,
    totalPaymentsCount,
    articles,
    activities,
    canCancel,
    cancelBlockReason,
    summary: {
      subtotalWithoutTax: sale.subtotal,
      tax: 0,
      amountWithTax: sale.subtotal,
      luxuryTax: 0,
      total: sale.totalAmount,
    },
  };
}

export async function cancelInvoice(
  invoiceId: string,
  payload: { reasonId: number; notes?: string },
): Promise<void> {
  const sale = await unwrapOrThrow(await getSaleDetail(Number(invoiceId)));
  if (!sale.client) {
    throw new Error("La venta no tiene cliente para cancelar.");
  }
  unwrapOrThrow(
    await cancelClientPurchase(sale.client.id, sale.id, payload),
  );
}

export async function cancelInvoiceArticle(_articleId: string): Promise<void> {
  throw new Error(
    "La cancelación de un artículo se hace desde la orden de servicio (indicaciones).",
  );
}

export type { ApiResult };
