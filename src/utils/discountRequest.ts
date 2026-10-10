/**
 * Digits typed into the discount quantity field.
 * `null` = the field was cleared. `undefined` = ignore the keystroke.
 * A value above `max` is ignored: clamping "12" to 3 is what turns a typed 2 into 3.
 */
export function parseDiscountQuantityInput(
  raw: string,
  max: number,
): number | null | undefined {
  if (raw === "") return null;
  if (!/^\d+$/.test(raw)) return undefined;
  const next = Number(raw);
  if (next < 1 || next > max) return undefined;
  return next;
}

export function discountRequestPiecesReady(
  pieces: Array<{ reason: string; notes?: string }>,
): boolean {
  return (
    pieces.length > 0 &&
    pieces.every(
      (piece) =>
        piece.reason.length > 0 &&
        (piece.reason !== "OTHER" || (piece.notes?.trim().length ?? 0) > 0),
    )
  );
}

export function syncDiscountPieceSlots<T>(
  slots: T[],
  count: number,
  create: () => T,
): T[] {
  if (count <= 0) return [];
  const next = slots.slice(0, count);
  while (next.length < count) next.push(create());
  return next;
}

export function groupDiscountPiecesBySku<
  T extends { sku: string; name: string },
>(pieces: T[]): Array<{ sku: string; name: string; pieces: T[] }> {
  const groups: Array<{ sku: string; name: string; pieces: T[] }> = [];
  for (const piece of pieces) {
    const sku = piece.sku.trim() || piece.name;
    const existing = groups.find((group) => group.sku === sku);
    if (existing) {
      existing.pieces.push(piece);
    } else {
      groups.push({ sku, name: piece.name, pieces: [piece] });
    }
  }
  return groups;
}

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
