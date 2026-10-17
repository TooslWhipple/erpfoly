/** Temporary: one down payment for every customer level. Set false to edit each level. */
export const USE_SINGLE_DOWN_PAYMENT = true;

export function promotionPercentageError(raw: string): string | undefined {
  if (!raw.trim()) return "El porcentaje es requerido";
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    return "El porcentaje no puede ser menor a 0";
  }
  return undefined;
}

export function withSingleDownPayment<T extends { percentage: number }>(
  rows: T[],
): T[] {
  if (!USE_SINGLE_DOWN_PAYMENT || rows.length === 0) return rows;
  const percentage = rows[0].percentage;
  return rows.map((row) => ({ ...row, percentage }));
}
