import type { MerchandiseReceptionInvoiceType } from "@/types/merchandise-reception-discrepancies.types";
import type { MerchandiseReceptionAvailableInvoice } from "@/types/merchandise-reception-discrepancies.types";
import type { SelectableInvoice } from "@/types/invoice-selector.types";

export const DISCREPANCY_INVOICE_TYPE_LABELS: Record<
  MerchandiseReceptionInvoiceType,
  string
> = {
  PUE: "PUE",
  PPD: "PPD",
  CREDIT_NOTE: "Nota de crédito",
};

export function discrepancyInvoiceToSelectable(
  invoice: MerchandiseReceptionAvailableInvoice,
): SelectableInvoice {
  return {
    id: invoice.id,
    externalId: invoice.externalId,
    date: invoice.date,
    amount: Math.abs(invoice.amount),
    paymentType: DISCREPANCY_INVOICE_TYPE_LABELS[invoice.type],
  };
}
