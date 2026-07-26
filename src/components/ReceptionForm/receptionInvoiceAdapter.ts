import type { ReceptionInvoice } from "@/types/recepcion-mercancias.types";
import type { SelectableInvoice } from "@/types/invoice-selector.types";

export function receptionInvoiceToSelectable(
    invoice: ReceptionInvoice,
): SelectableInvoice {
    return {
        id: invoice.id,
        externalId: invoice.fiscalFolio,
        date: invoice.date,
        amount: invoice.amount,
        paymentType: invoice.paymentType,
        origin: invoice.origin,
    };
}

export function selectableToReceptionInvoice(
    invoice: SelectableInvoice,
): ReceptionInvoice {
    return {
        id: invoice.id,
        fiscalFolio: invoice.externalId,
        date: invoice.date,
        amount: invoice.amount,
        paymentType: invoice.paymentType,
        origin: invoice.origin,
    };
}
