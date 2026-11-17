import type { ClientStatus } from "@/types/clientes.types";
import type { BackendSaleCreditActiveItem } from "@/types/clientPayment.types";
import type { OpenClientLayaway } from "@/services/ventas.service";
import { isCreditClient } from "./client";

export type ClientPaymentAccessDenialReason =
  | "inactive"
  | "cash-client"
  | "no-payable-credit";

export function getClientPaymentAccessDenial(input: {
  creditApplicationId: number | null | undefined;
  status: ClientStatus | null | undefined;
  activeCredits: Pick<BackendSaleCreditActiveItem, "outstanding_balance">[];
  /** Apartados abiertos del cliente en la sucursal activa (cobrables aunque sea de contado). */
  openLayaways?: Pick<OpenClientLayaway, "totalDue">[];
}): ClientPaymentAccessDenialReason | null {
  const status = input.status ?? "active";
  if (status !== "active") {
    return "inactive";
  }

  const hasPayableLayaway = (input.openLayaways ?? []).some(
    (layaway) => layaway.totalDue > 0,
  );
  if (hasPayableLayaway) {
    return null;
  }

  if (!isCreditClient({ creditApplicationId: input.creditApplicationId })) {
    return "cash-client";
  }

  const hasPayableCredit = input.activeCredits.some(
    (credit) => credit.outstanding_balance > 0,
  );
  if (!hasPayableCredit) {
    return "no-payable-credit";
  }

  return null;
}

export function getClientPaymentAccessDenialMessage(
  reason: ClientPaymentAccessDenialReason,
): string | null {
  switch (reason) {
    case "cash-client":
      return "Este cliente es de contado y no tiene apartados con saldo pendiente.";
    case "no-payable-credit":
      return "El cliente no tiene compras a crédito con parcialidades pendientes ni apartados con saldo.";
    case "inactive":
      return null;
  }
}
