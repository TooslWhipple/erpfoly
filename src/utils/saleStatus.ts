import type { StatusChipVariant } from "@/components/TableCrud";
import type { SaleListItem, SaleStatus } from "@/types/ventas.types";
import type { HandoverProgress } from "@/types/saleHandover.types";

export const SALE_STATUS_CHIP_LABELS: Record<SaleStatus, string> = {
  DRAFT: "Borrador",
  PENDING_DISCOUNT: "Descuento pendiente",
  PENDING_CASHIER: "Pendiente de cobro",
  PENDING_PAYMENT: "Pago pendiente",
  PAID: "Pagada",
  CANCELLED: "Cancelada",
};

export const SALE_STATUS_CHIP_VARIANTS: Record<SaleStatus, StatusChipVariant> = {
  DRAFT: "default",
  PENDING_DISCOUNT: "warning",
  PENDING_CASHIER: "info",
  PENDING_PAYMENT: "warning",
  PAID: "success",
  CANCELLED: "error",
};

/** True when the cashier can still collect payment for this sale. */
export function isSaleCollectableByCashier(sale: SaleListItem): boolean {
  return (
    sale.status === "PENDING_CASHIER" ||
    (sale.status === "PENDING_PAYMENT" && sale.paymentType === "LAYAWAY")
  );
}

export const HANDOVER_STATUS_LABELS: Record<HandoverProgress, string> = {
  PENDING: "Pendiente de entrega",
  PARTIALLY_DELIVERED: "Entrega parcial",
  DELIVERED: "Entregada completa",
  CLOSED: "Cerrada con regularización",
};

export const HANDOVER_STATUS_VARIANTS: Record<
  HandoverProgress,
  StatusChipVariant
> = {
  PENDING: "warning",
  PARTIALLY_DELIVERED: "info",
  DELIVERED: "success",
  CLOSED: "default",
};
