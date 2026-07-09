export function formatDiscountRequestReasonList(
  reason: string,
  reasonCode?: string,
  notes?: string | null
): string {
  if (reasonCode === "OTHER" && notes?.trim()) {
    return `${reason}. Nota: ${notes.trim()}`;
  }
  return reason;
}

export const DISCOUNT_REQUEST_REASON_LABELS: Record<string, string> = {
  LAST_UNIT: "Última pieza",
  DAMAGED_ITEM: "Pieza dañada o con desperfecto",
  CLOSING_SALE: "Cierre de venta",
  OTHER: "Otro motivo",
};

export function getDiscountRequestReasonLabel(
  reasonCode: string,
  notes?: string | null
): string {
  const label = DISCOUNT_REQUEST_REASON_LABELS[reasonCode] ?? reasonCode;
  return formatDiscountRequestReasonList(label, reasonCode, notes);
}

export const DISCOUNT_REQUEST_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente de autorización",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  INVALIDATED: "Invalidado",
};

export function getDiscountRequestStatusLabel(status: string): string {
  return DISCOUNT_REQUEST_STATUS_LABELS[status] ?? status;
}
