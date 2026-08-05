import type { AvailablePayableInvoice } from "@/services/recepcion-mercancias.service";
import type { SelectableInvoice } from "@/types/invoice-selector.types";

export const COSTEO_INVOICE_TYPE_LABELS: Record<string, string> = {
    PUE: "PUE",
    PPD: "PPD",
    CREDIT_NOTE: "Nota de Crédito",
};

export function payableToSelectableForCosteo(
    invoice: AvailablePayableInvoice,
): SelectableInvoice {
    return {
        id: `payable-${invoice.id}`,
        externalId: invoice.invoiceNumber,
        date: invoice.issuedAt,
        amount: invoice.total,
        paymentType: invoice.paymentType,
        origin: invoice.origin,
    };
}
