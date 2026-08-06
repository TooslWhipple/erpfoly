import { useEffect, useState } from "react";
import type { SelectableInvoice } from "@/types/invoice-selector.types";
import { selectableToReceptionInvoice } from "./receptionInvoiceAdapter";
import {
    getAvailablePayableInvoices,
    type AvailablePayableInvoice,
} from "@/services/recepcion-mercancias.service";

function payableToSelectable(
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

export function useReceptionAvailableInvoices(
    supplierId: number | null,
    receptionId?: number,
) {
    const [invoices, setInvoices] = useState<SelectableInvoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        if (supplierId == null) {
            setInvoices([]);
            return;
        }
        setLoading(true);
        setError(null);
        const result = await getAvailablePayableInvoices(supplierId, receptionId);
        setLoading(false);
        if (result.error || !result.data) {
            setError(result.error?.message ?? "No se pudieron cargar las facturas");
            setInvoices([]);
            return;
        }
        setInvoices(result.data.map(payableToSelectable));
    };

    useEffect(() => {
        void refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supplierId, receptionId]);

    return { availableInvoices: invoices, loading, error, refetch };
}

export { selectableToReceptionInvoice };
