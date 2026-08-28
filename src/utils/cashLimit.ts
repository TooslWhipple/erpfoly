export type CashLimitLevel = "safe" | "warning" | "exceeded";

const WARNING_RATIO = 0.75;

export function getCashLimitLevel(
  currentCash: number,
  limit: number,
): CashLimitLevel {
  if (!(limit > 0)) return "safe";
  const ratio = currentCash / limit;
  if (ratio > 1) return "exceeded";
  if (ratio > WARNING_RATIO) return "warning";
  return "safe";
}

export function getCashLimitProgress(currentCash: number, limit: number): number {
  if (!(limit > 0)) return 0;
  return Math.min(100, (currentCash / limit) * 100);
}
