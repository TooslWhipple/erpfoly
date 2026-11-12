export type RecoveryTimelineOrder = {
  id: string;
  folio?: string;
  generatedAt?: string;
  cancellationRequestedAt?: string | null;
  recoverySheetId?: string | null;
  recoverySheetFolio?: string | null;
  recoverySheetStatus?: string | null;
  recoverySheetCreatedAt?: string | null;
  recoverySheetReceivedAt?: string | null;
  recoverySheetUpdatedAt?: string | null;
  recoverySettledAt?: string | null;
  recoveryCreditAmount?: number | null;
};

export type RecoveryTimelineEvent = {
  id: string;
  date: string;
  type: "note" | "status_change";
  title: string;
  description?: string;
  amount?: number;
};

function sheetLabel(order: RecoveryTimelineOrder): string {
  return [order.folio, order.recoverySheetFolio].filter(Boolean).join(" · ");
}

/** Hechos de la hoja que la actividad de la venta todavía no contaba. */
export function recoveryTimelineEvents(
  order: RecoveryTimelineOrder,
): RecoveryTimelineEvent[] {
  if (!order.recoverySheetId) return [];
  const events: RecoveryTimelineEvent[] = [];
  const openedAt =
    order.cancellationRequestedAt ??
    order.recoverySheetCreatedAt ??
    order.generatedAt;
  if (openedAt) {
    events.push({
      id: `os-sheet-${order.id}`,
      date: openedAt,
      type: "note",
      title: order.cancellationRequestedAt
        ? "Recuperación solicitada"
        : "Hoja de recuperación generada",
      description: sheetLabel(order) || undefined,
    });
  }
  if (
    order.recoverySheetStatus === "recuperada" &&
    order.recoverySheetReceivedAt
  ) {
    events.push({
      id: `os-recovered-${order.id}`,
      date: order.recoverySettledAt ?? order.recoverySheetReceivedAt,
      type: "status_change",
      title: "Artículo recuperado",
      description: sheetLabel(order) || undefined,
      amount: order.recoveryCreditAmount ?? undefined,
    });
  }
  if (order.recoverySheetStatus === "cancelada") {
    const closedAt =
      order.recoverySheetUpdatedAt ??
      order.recoverySheetCreatedAt ??
      order.generatedAt;
    if (closedAt) {
      events.push({
        id: `os-not-recovered-${order.id}`,
        date: closedAt,
        type: "status_change",
        title: "Artículo no recuperado",
        description: sheetLabel(order) || undefined,
      });
    }
  }
  return events;
}
