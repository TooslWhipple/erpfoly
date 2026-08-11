/** Round to 2 decimal places (currency cents). */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}
