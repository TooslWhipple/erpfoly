import type { ClientCreditAccount } from "../types/clientPayment.types";
import { roundToCents } from "./number";

export interface CascadeInstallmentPreview {
  purchaseId: string;
  installmentId: string;
  amountApplied: number;
  fullyCovered: boolean;
}

/**
 * Réplica en el cliente de la regla de cascada del backend
 * (`registerCascadePayment` en Apifoly): aplana las parcialidades
 * pendientes de todas las cuentas incluidas (sin excluir) y las ordena por
 * `dueDateRaw` real, cruzando facturas/créditos — no por el orden en que
 * vienen las cuentas ni por el orden interno de parcialidades de cada una.
 * Por cada parcialidad, primero cubre su mora (`overdueAmount`) y el resto
 * va a capital, igual que `allocatePaymentAcrossInstallments` en el
 * backend. Es solo un preview visual; el backend recalcula y persiste con
 * su propia lógica al confirmar.
 */
function flattenPendingInstallments(
  accounts: ClientCreditAccount[],
  excludedCreditIds: string[],
) {
  return accounts
    .filter((account) => !excludedCreditIds.includes(account.id))
    .flatMap((account) =>
      account.pendingInstallments.map((installment) => ({
        purchaseId: account.id,
        installment,
      })),
    )
    .sort(
      (a, b) =>
        new Date(a.installment.dueDateRaw).getTime() -
        new Date(b.installment.dueDateRaw).getTime(),
    );
}

export function calculateCascadePreview(
  accounts: ClientCreditAccount[],
  excludedCreditIds: string[],
  totalAmount: number,
): CascadeInstallmentPreview[] {
  let remaining = totalAmount;
  const preview: CascadeInstallmentPreview[] = [];

  const flattened = flattenPendingInstallments(accounts, excludedCreditIds);

  for (const { purchaseId, installment } of flattened) {
    if (remaining <= 0) break;

    const overdueAmount = Math.max(0, installment.overdueAmount);
    const lateFeeApplied = Math.min(remaining, overdueAmount);
    // Redondear a centavos en cada paso evita que el error de punto
    // flotante acumulado dentro de esta cascada (p. ej. restar 637.42 tres
    // veces) deje un residuo positivo ínfimo (2.27e-13) que no pasa el
    // `if (remaining <= 0) break` y genera una parcialidad fantasma: como
    // `numeral` no formatea notación exponencial, ese residuo se mostraba
    // como "Abono parcial ($NaN)" en vez de agotar limpio la cascada.
    remaining = roundToCents(remaining - lateFeeApplied);

    const principalApplied = Math.min(remaining, installment.totalAmount);
    remaining = roundToCents(remaining - principalApplied);

    const amountApplied = lateFeeApplied + principalApplied;
    if (amountApplied <= 0) continue;

    preview.push({
      purchaseId,
      installmentId: installment.id,
      amountApplied,
      fullyCovered: principalApplied >= installment.totalAmount - 0.001,
    });
  }

  return preview;
}

/**
 * Total de parcialidades pendientes cruzando las cuentas incluidas (sin
 * excluir). Sirve como máximo del stepper de "cuántas parcialidades".
 */
export function getTotalPendingInstallmentsCount(
  accounts: ClientCreditAccount[],
  excludedCreditIds: string[],
): number {
  return flattenPendingInstallments(accounts, excludedCreditIds).length;
}

/**
 * Tope cobrable de las cuentas incluidas: capital pendiente de la cuenta
 * más la mora de cada parcialidad. El saldo de la cuenta no incluye mora,
 * así que usarlo solo como tope recortaba el abono al seleccionar varias
 * parcialidades vencidas.
 */
export function getTotalCollectableAmount(
  accounts: ClientCreditAccount[],
  excludedCreditIds: string[],
): number {
  const flattened = flattenPendingInstallments(accounts, excludedCreditIds);
  const principalOutstanding = accounts
    .filter((account) => !excludedCreditIds.includes(account.id))
    .reduce((sum, account) => sum + account.remaining, 0);
  const lateFeeOutstanding = flattened.reduce(
    (sum, { installment }) => sum + Math.max(0, installment.overdueAmount),
    0,
  );
  return roundToCents(principalOutstanding + lateFeeOutstanding);
}

/**
 * Monto exacto (mora + principal) de las primeras `count` parcialidades
 * pendientes, cruzando cuentas incluidas y ordenadas por `dueDateRaw`, igual
 * que `calculateCascadePreview`. Se usa para autollenar el campo de monto
 * cuando el cajero elige un conteo de parcialidades en vez de un monto libre.
 */
export function calculateAmountForInstallmentCount(
  accounts: ClientCreditAccount[],
  excludedCreditIds: string[],
  count: number,
): number {
  const flattened = flattenPendingInstallments(accounts, excludedCreditIds);

  const rawAmount = flattened
    .slice(0, count)
    .reduce(
      (sum, { installment }) =>
        sum + Math.max(0, installment.overdueAmount) + installment.totalAmount,
      0,
    );

  // La suma de las parcialidades individuales puede exceder por unos
  // centavos el saldo real de la cuenta (redondeo del backend al dividir el
  // total entre parcialidades). Se acota al capital pendiente más la mora,
  // no solo al capital, para que "seleccionar todas" incluya moratorios.
  const collectable = getTotalCollectableAmount(accounts, excludedCreditIds);

  // Sumar montos en punto flotante puede dejar residuos (p. ej.
  // 1076.4450000000002); se redondea a centavos antes de usarlo como monto
  // a enviar al backend, no solo para mostrarlo en el input.
  return roundToCents(Math.min(rawAmount, collectable));
}
