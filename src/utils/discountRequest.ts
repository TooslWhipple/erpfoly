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
