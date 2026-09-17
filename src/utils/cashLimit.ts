export type CashLimitLevel = "safe" | "warning" | "exceeded";

const WARNING_RATIO = 0.75;

const CASH_LIMIT_LEVEL_LABELS: Record<CashLimitLevel, string> = {
  safe: "nivel óptimo",
  warning: "cerca del límite",
  exceeded: "límite excedido",
};

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

export function getCashLimitLevelLabel(level: CashLimitLevel): string {
  return CASH_LIMIT_LEVEL_LABELS[level];
}
