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
