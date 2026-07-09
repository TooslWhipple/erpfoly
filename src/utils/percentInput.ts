/**
 * Shared helpers for whole-percent (1-90) margin fields entered as text.
 *
 * Margin is always a whole number of percentage points (e.g. "20" for 20%),
 * never a decimal fraction (e.g. "0.20") — mixing the two units is what
 * caused several departments to silently store a margin 100x too small.
 */

export function formatPercentFieldValue(value: number): string {
  return Number.isFinite(value) ? String(value) : "";
}

/** Strips anything that isn't a digit, so the field can never hold a decimal point or sign. */
export function sanitizeIntegerPercentInput(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

export function parsePercentFieldInput(raw: string): number | null {
  const normalized = sanitizeIntegerPercentInput(raw.trim());
  if (normalized === "") return null;
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  return n;
}

// Debe coincidir con MAX_MARGIN_PERCENT en Apifoly/src/modules/product/utils/price-calculator.ts
export const MAX_PROFIT_MARGIN_PERCENT = 90;
export const MIN_PROFIT_MARGIN_PERCENT = 1;

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
      ? "Debe ser un número entero (ej. 20 para 20%)."
      : parsed < MIN_PROFIT_MARGIN_PERCENT || parsed > MAX_PROFIT_MARGIN_PERCENT
        ? `El margen debe ser un entero entre ${MIN_PROFIT_MARGIN_PERCENT} y ${MAX_PROFIT_MARGIN_PERCENT}.`
        : null;

  const displayError = blockingError != null && !trimmedEmpty;
  const helperText = displayError
    ? blockingError
    : `Número entero entre ${MIN_PROFIT_MARGIN_PERCENT} y ${MAX_PROFIT_MARGIN_PERCENT} (ej. 20 para 20%).`;
  const canSave =
    blockingError === null &&
    parsed !== null &&
    parsed !== savedMargin;

  return { parsed, canSave, displayError, helperText };
}
