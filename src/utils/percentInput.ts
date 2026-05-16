/**
 * Shared helpers for 0–100% numeric fields entered as decimal text.
 */

export function formatPercentFieldValue(value: number): string {
  return Number.isFinite(value) ? String(value) : "";
}

export function parsePercentFieldInput(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (normalized === "") return null;
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  return n;
}

export interface ProfitMarginFieldState {
  parsed: number | null;
  canSave: boolean;
  displayError: boolean;
  helperText: string;
}

export function getProfitMarginFieldState(
  draft: string,
  savedMargin: number,
): ProfitMarginFieldState {
  const parsed = parsePercentFieldInput(draft);
  const trimmedEmpty = draft.trim() === "";

  const blockingError = trimmedEmpty
    ? "Ingresa un porcentaje."
    : parsed === null
      ? "Debe ser un número válido."
      : parsed < 0 || parsed > 100
        ? "El margen debe estar entre 0 y 100."
        : null;

  const displayError = blockingError != null && !trimmedEmpty;
  const helperText = displayError ? blockingError : "Porcentaje entre 0 y 100.";
  const canSave =
    blockingError === null &&
    parsed !== null &&
    Math.abs(parsed - savedMargin) > 1e-9;

  return { parsed, canSave, displayError, helperText };
}
