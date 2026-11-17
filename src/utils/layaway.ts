import { roundToCents } from "./number";

/** Porcentaje mínimo del total que se debe pagar de enganche en un apartado. */
export const LAYAWAY_MIN_DEPOSIT_PERCENT = 10;

/**
 * Enganche mínimo de un apartado, redondeado hacia arriba al centavo.
 * El porcentaje lo manda el servidor; sin oferta se usa el 10 %.
 * Opera en centavos enteros para evitar errores de punto flotante.
 */
export function layawayMinimumDeposit(
  total: number,
  percent: number = LAYAWAY_MIN_DEPOSIT_PERCENT,
): number {
  return Math.ceil((Math.round(total * 100) * percent) / 100) / 100;
}

/** Saldo a liquidar de un apartado tras pagar el enganche mínimo. */
export function layawayBalance(total: number): number {
  return roundToCents(total - layawayMinimumDeposit(total));
}

const mxnFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

/** Monto en pesos con miles y 2 decimales (mismo formato que Crédito). */
function formatMxn(value: number): string {
  return mxnFormatter.format(value);
}

/**
 * Valida el enganche elegido de un apartado: no puede ser menor al mínimo ni
 * mayor al total. Devuelve el mensaje o null si es válido (mismos textos que
 * el backend).
 */
export function layawayDownPaymentError(
  total: number,
  amount: number | null,
  percent: number = LAYAWAY_MIN_DEPOSIT_PERCENT,
): string | null {
  if (amount == null || !Number.isFinite(amount)) {
    return "Captura un enganche válido";
  }
  const minimum = layawayMinimumDeposit(total, percent);
  const cents = Math.round(amount * 100);
  if (cents < Math.round(minimum * 100)) {
    const label = Number.isInteger(percent)
      ? String(percent)
      : percent.toFixed(2).replace(/\.?0+$/, "");
    return `El enganche no puede ser menor al ${label}% (${formatMxn(minimum)})`;
  }
  if (cents > Math.round(total * 100)) {
    return "El enganche no puede ser mayor al total de la venta";
  }
  return null;
}
