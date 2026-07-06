import type { StatusChipVariant } from "@/components/TableCrud";
import type { SaleStatus } from "@/types/ventas.types";

export const SALE_STATUS_CHIP_LABELS: Record<SaleStatus, string> = {
  DRAFT: "Borrador",
  PENDING_PAYMENT: "Pago pendiente",
  PAID: "Pagada",
  PARTIALLY_DELIVERED: "Parcialmente entregada",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
};

export const SALE_STATUS_CHIP_VARIANTS: Record<SaleStatus, StatusChipVariant> = {
  DRAFT: "default",
  PENDING_PAYMENT: "warning",
  PAID: "success",
  PARTIALLY_DELIVERED: "info",
  DELIVERED: "success",
  CANCELLED: "error",
};
