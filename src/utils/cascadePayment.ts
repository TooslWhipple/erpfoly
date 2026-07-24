import type { ClientCreditAccount } from "@/types/clientPayment.types";

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
export function calculateCascadePreview(
  accounts: ClientCreditAccount[],
  excludedCreditIds: string[],
  totalAmount: number,
): CascadeInstallmentPreview[] {
  let remaining = totalAmount;
  const preview: CascadeInstallmentPreview[] = [];

  const flattened = accounts
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

  for (const { purchaseId, installment } of flattened) {
    if (remaining <= 0) break;

    const overdueAmount = Math.max(0, installment.overdueAmount);
    const lateFeeApplied = Math.min(remaining, overdueAmount);
    remaining -= lateFeeApplied;

    const principalApplied = Math.min(remaining, installment.totalAmount);
    remaining -= principalApplied;

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
