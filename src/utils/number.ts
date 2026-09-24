/** Round to 2 decimal places (currency cents). */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** 10% down payment, rounded up to the next cent. */
export function creditMinimumDownPayment(total: number): number {
  return Math.ceil(total * 10) / 100;
}

/**
 * Draft while typing a money amount. Digits and one decimal point, at most
 * two cents. A comma is the decimal mark only when one or two digits follow
 * it (`1500,50`). Thousand groups (`10,000`, and `1,0000` while the next
 * digit is still landing) are stripped.
 */
export function sanitizeCreditDownPaymentInput(raw: string): string {
  let text = raw.replace(/[^\d.,]/g, "");
  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");
  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      text = text.replace(/\./g, "").replace(",", ".");
    }
    text = text.replace(/,/g, "");
  } else if (lastComma !== -1) {
    text = /^\d+,\d{1,2}$/.test(text)
      ? text.replace(",", ".")
      : text.replace(/,/g, "");
  }
  const dot = text.indexOf(".");
  if (dot === -1) return text.replace(/^0+(?=\d)/, "").slice(0, 12);
  const whole = (text.slice(0, dot).replace(/^0+(?=\d)/, "") || "0").slice(0, 12);
  const decimals = text.slice(dot + 1).replace(/\D/g, "").slice(0, 2);
  return `${whole}.${decimals}`;
}

export function parseCreditDownPayment(raw: string): number | null {
  const text = sanitizeCreditDownPaymentInput(raw);
  if (!/^\d+(\.\d{0,2})?$/.test(text)) return null;
  const value = Number(text);
  if (!Number.isFinite(value)) return null;
  return roundToCents(value);
}

/** Regular installment. The last one absorbs the remaining cents at confirm. */
export function creditInstallmentAmount(financed: number, months: number): number {
  if (months <= 0) return 0;
  return roundToCents(financed / months);
}

if (process.env.NODE_ENV === "test") {
  if (creditMinimumDownPayment(10.04) !== 1.01) {
    throw new Error("creditMinimumDownPayment: 10.04 must ceil to 1.01");
  }
  if (creditMinimumDownPayment(10) !== 1) {
    throw new Error("creditMinimumDownPayment: 10.00 must stay 1.00");
  }
  if (creditInstallmentAmount(7649, 12) !== 637.42) {
    throw new Error("creditInstallmentAmount: 7649 / 12 rounds to 637.42");
  }
  if (sanitizeCreditDownPaymentInput("ab12.999$") !== "12.99") {
    throw new Error("sanitizeCreditDownPaymentInput: digits and two cents");
  }
  if (sanitizeCreditDownPaymentInput("1,234.50") !== "1234.50") {
    throw new Error("sanitizeCreditDownPaymentInput: thousands comma");
  }
  if (sanitizeCreditDownPaymentInput("10,000") !== "10000") {
    throw new Error("sanitizeCreditDownPaymentInput: 10,000 is ten thousand");
  }
  if (sanitizeCreditDownPaymentInput("1,0000") !== "10000") {
    throw new Error("sanitizeCreditDownPaymentInput: grouped digit must not become 1");
  }
  if (sanitizeCreditDownPaymentInput("1500,50") !== "1500.50") {
    throw new Error("sanitizeCreditDownPaymentInput: decimal comma");
  }
  if (sanitizeCreditDownPaymentInput("1.234,50") !== "1234.50") {
    throw new Error("sanitizeCreditDownPaymentInput: dot groups and decimal comma");
  }
  if (parseCreditDownPayment("") !== null || parseCreditDownPayment("10.") !== 10) {
    throw new Error("parseCreditDownPayment: empty is blank, trailing dot is the number");
  }
}
