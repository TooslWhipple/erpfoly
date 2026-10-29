import type { StatusChipVariant } from "@/components/StatusChip";

const EDITABLE_STATUSES = new Set(["draft", "pre_authorized", "pre_captured"]);

/** Folios donde todavía se puede capturar o corregir cantidades. */
export function canEditMerchandiseReception(status: string): boolean {
  return EDITABLE_STATUSES.has(status);
}

export function getMerchandiseReceptionStatusPresentation(status: string): {
  label: string;
  variant: StatusChipVariant;
} | null {
  switch (status) {
    case "draft":
      return { label: "Borrador", variant: "default" };
    case "pre_authorized":
      return { label: "Preautorizado", variant: "warning" };
    case "pre_captured":
      return { label: "Precapturado", variant: "success" };
    case "in_costing":
      return { label: "En costeo", variant: "info" };
    case "captured":
      return { label: "Capturado", variant: "info" };
    case "costed":
      return { label: "Costeado", variant: "success" };
    case "cancelled":
      return { label: "Cancelado", variant: "warning" };
    default:
      return null;
  }
}
