import type { ClientCreditAccount } from "@/types/clientPayment.types";

export interface CascadeInstallmentPreview {
  purchaseId: string;
  installmentId: string;
  amountApplied: number;
  fullyCovered: boolean;
}

/**
 * Réplica en el cliente de la regla de cascada del backend
 * (`registerCascadePayment` en Apifoly): recorre las cuentas en el orden
 * recibido (crédito más antiguo primero, salvo que el cajero lo haya
 * reordenado), y dentro de cada una sus parcialidades pendientes en orden,
 * aplicando el monto total hasta agotarlo. Es solo un preview visual; el
 * backend recalcula y persiste con su propia lógica al confirmar.
 */
export function calculateCascadePreview(
  accounts: ClientCreditAccount[],
  excludedCreditIds: string[],
  totalAmount: number,
): CascadeInstallmentPreview[] {
  let remaining = totalAmount;
  const preview: CascadeInstallmentPreview[] = [];

  for (const account of accounts) {
    if (remaining <= 0) break;
    if (excludedCreditIds.includes(account.id)) continue;

    for (const installment of account.pendingInstallments) {
      if (remaining <= 0) break;

      const amountApplied = Math.min(remaining, installment.totalAmount);
      if (amountApplied <= 0) continue;

      remaining -= amountApplied;
      preview.push({
        purchaseId: account.id,
        installmentId: installment.id,
        amountApplied,
        fullyCovered: amountApplied >= installment.totalAmount - 0.001,
      });
    }
  }

  return preview;
}
