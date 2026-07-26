import type { CosteoAvailableInvoice, CosteoInvoiceType } from "@/types/costeos.types";
import type { SelectableInvoice } from "@/types/invoice-selector.types";

export const COSTEO_INVOICE_TYPE_LABELS: Record<CosteoInvoiceType, string> = {
    PUE: "PUE",
    PPD: "PPD",
    CREDIT_NOTE: "Nota de Crédito",
};

export function costeoInvoiceToSelectable(
    invoice: CosteoAvailableInvoice,
): SelectableInvoice {
    return {
        id: String(invoice.id),
        externalId: invoice.externalId,
        date: invoice.date,
        amount: invoice.amount,
        paymentType: COSTEO_INVOICE_TYPE_LABELS[invoice.type],
    };
}
