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

export function formatSaleDiscountRequestReason(request: {
  reason: string;
  notes?: string | null;
  items?: Array<{ reason?: string; notes?: string | null }>;
}): string {
  const detailed = (request.items ?? []).filter((item) => item.reason);
  if (detailed.length === 0) {
    return getDiscountRequestReasonLabel(request.reason, request.notes);
  }
  const labels = detailed.map((item) =>
    getDiscountRequestReasonLabel(item.reason ?? "", item.notes),
  );
  return [...new Set(labels)].join(", ");
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
