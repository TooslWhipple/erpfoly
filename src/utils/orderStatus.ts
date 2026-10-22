import type { StatusChipVariant } from "@/components/StatusChip";

/** Estatus de un pedido a proveedor tal como lo devuelve el back. */
export type OrderBackendStatus =
  | "pending"
  | "scheduled"
  | "in_progress"
  | "shipped"
  | "partially_delivered"
  | "delivered"
  | "cancelled"
  | "closed";

const LABELS: Record<OrderBackendStatus, string> = {
  pending: "Solicitado",
  scheduled: "Programado",
  in_progress: "En curso",
  shipped: "Enviado",
  partially_delivered: "Parcialmente entregado",
  delivered: "Recibido",
  cancelled: "Cancelado",
  closed: "Cerrado",
};

const VARIANTS: Record<OrderBackendStatus, StatusChipVariant> = {
  pending: "pending",
  scheduled: "infoAlt",
  in_progress: "info",
  shipped: "infoAlt",
  partially_delivered: "info",
  delivered: "success",
  cancelled: "error",
  closed: "disabled",
};

function isKnown(status: string): status is OrderBackendStatus {
  return status in LABELS;
}

export function getOrderStatusLabel(status: string): string {
  return isKnown(status) ? LABELS[status] : status;
}

export function getOrderStatusVariant(status: string): StatusChipVariant {
  return isKnown(status) ? VARIANTS[status] : "default";
}

/** Errores 409 que significan "la pantalla quedó desfasada": se recarga el pedido. */
const STALE_ORDER_ERROR_CODES = new Set([
  "ORDER_NOT_PENDING",
  "ORDER_NOT_ADJUSTABLE",
  "ORDER_NOT_PARTIALLY_DELIVERED",
  "ORDER_HAS_OPEN_RECEPTIONS",
  "ORDER_NOT_OPEN",
]);

export function isStaleOrderErrorCode(code: string | undefined): boolean {
  return code !== undefined && STALE_ORDER_ERROR_CODES.has(code);
}

/**
 * Estimación de ventas que dejan de estar cubiertas por el pedido al bajar el
 * pendiente (Contrato): max(0, comprometido − otros − nuevo) − max(0, comprometido − otros − actual).
 */
export function estimateUncoveredSales(line: {
  committedOrdered: number;
  otherIncoming: number;
  pendingQuantity: number;
}, newPending: number): number {
  const base = line.committedOrdered - line.otherIncoming;
  return Math.max(0, base - newPending) - Math.max(0, base - line.pendingQuantity);
}
