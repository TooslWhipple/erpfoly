import { roundToCents } from "./number";

/** Porcentaje mínimo del total que se debe pagar de enganche en un apartado. */
export const LAYAWAY_MIN_DEPOSIT_PERCENT = 10;

/**
 * Enganche mínimo de un apartado: 10% del total redondeado hacia arriba al
 * centavo. Opera en centavos enteros para evitar errores de punto flotante.
 */
export function layawayMinimumDeposit(total: number): number {
  return (
    Math.ceil((Math.round(total * 100) * LAYAWAY_MIN_DEPOSIT_PERCENT) / 100) /
    100
  );
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
): string | null {
  if (amount == null || !Number.isFinite(amount)) {
    return "Captura un enganche válido";
  }
  const minimum = layawayMinimumDeposit(total);
  const cents = Math.round(amount * 100);
  if (cents < Math.round(minimum * 100)) {
    return `El enganche no puede ser menor al ${LAYAWAY_MIN_DEPOSIT_PERCENT}% (${formatMxn(minimum)})`;
  }
  if (cents > Math.round(total * 100)) {
    return "El enganche no puede ser mayor al total de la venta";
  }
  return null;
}
