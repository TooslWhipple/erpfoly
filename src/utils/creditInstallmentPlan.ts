/** Copy for the persisted monthly plan. Last installment may absorb rounding. */
export function formatCreditInstallmentPlan(
  installments: Array<{ amount: number }>,
  formatMoney: (amount: number) => string,
): string | null {
  if (installments.length === 0) return null;
  const last = installments[installments.length - 1]!;
  const regular = installments.slice(0, -1);
  const lastDiffers = regular.some((row) => row.amount !== last.amount);
  if (!lastDiffers) {
    return `${installments.length} pagos mensuales de ${formatMoney(last.amount)}`;
  }
  return `${regular.length} pagos mensuales de ${formatMoney(regular[0]!.amount)} y 1 pago final de ${formatMoney(last.amount)}`;
}

if (process.env.NODE_ENV === "test") {
  const money = (n: number) => `$${n.toFixed(2)}`;
  const even = formatCreditInstallmentPlan(
    Array.from({ length: 12 }, () => ({ amount: 127.5 })),
    money,
  );
  if (even !== "12 pagos mensuales de $127.50") {
    throw new Error("creditInstallmentPlan: even installments");
  }
  const rounded = formatCreditInstallmentPlan(
    [
      ...Array.from({ length: 11 }, () => ({ amount: 127.5 })),
      { amount: 127.55 },
    ],
    money,
  );
  if (rounded !== "11 pagos mensuales de $127.50 y 1 pago final de $127.55") {
    throw new Error("creditInstallmentPlan: last installment rounding");
  }
  if (formatCreditInstallmentPlan([], money) !== null) {
    throw new Error("creditInstallmentPlan: empty plan");
  }
}
