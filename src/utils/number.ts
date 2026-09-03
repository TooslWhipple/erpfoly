/** Round to 2 decimal places (currency cents). */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** 10% down payment, rounded up to the next cent. */
export function creditMinimumDownPayment(total: number): number {
  return Math.ceil(total * 10) / 100;
}

if (process.env.NODE_ENV === "test") {
  if (creditMinimumDownPayment(10.04) !== 1.01) {
    throw new Error("creditMinimumDownPayment: 10.04 must ceil to 1.01");
  }
  if (creditMinimumDownPayment(10) !== 1) {
    throw new Error("creditMinimumDownPayment: 10.00 must stay 1.00");
  }
}
