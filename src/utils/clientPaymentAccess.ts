import type { ClientStatus } from "@/types/clientes.types";
import type { BackendSaleCreditActiveItem } from "@/types/clientPayment.types";
import { isCreditClient } from "@/utils/client";

export type ClientPaymentAccessDenialReason =
  | "inactive"
  | "cash-client"
  | "no-payable-credit";

export function getClientPaymentAccessDenial(input: {
  creditApplicationId: number | null | undefined;
  status: ClientStatus | null | undefined;
  activeCredits: Pick<BackendSaleCreditActiveItem, "outstanding_balance">[];
}): ClientPaymentAccessDenialReason | null {
  const status = input.status ?? "active";
  if (status !== "active") {
    return "inactive";
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
      return "Este cliente es de contado y no puede registrar abonos.";
    case "no-payable-credit":
      return "El cliente no tiene compras a crédito vigentes con parcialidades pendientes.";
    case "inactive":
      return null;
  }
}
