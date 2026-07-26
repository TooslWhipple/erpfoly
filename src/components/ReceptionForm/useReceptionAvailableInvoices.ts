import { useEffect, useState } from "react";
import type { SelectableInvoice } from "@/types/invoice-selector.types";
import { receptionInvoiceToSelectable } from "./receptionInvoiceAdapter";
import type { ReceptionInvoice } from "@/types/recepcion-mercancias.types";

const DUMMY_AVAILABLE_INVOICES: ReceptionInvoice[] = [
    {
        id: "inv-1",
        fiscalFolio: "91212DD3X44",
        date: "18/05/26",
        amount: 197560,
        origin: "ADD",
        paymentType: "PUE",
    },
    {
        id: "inv-2",
        fiscalFolio: "AA9912BB334",
        date: "20/05/26",
        amount: 56000,
        origin: "Correo",
        paymentType: "PUE",
    },
    {
        id: "inv-3",
        fiscalFolio: "ZZ8821CC110",
        date: "22/05/26",
        amount: 253560,
        origin: "ADD",
        paymentType: "PUE",
    },
];

export function useReceptionAvailableInvoices() {
    const [invoices, setInvoices] = useState<SelectableInvoice[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const timer = setTimeout(() => {
            if (cancelled) return;
            setInvoices(
                DUMMY_AVAILABLE_INVOICES.map(receptionInvoiceToSelectable),
            );
            setLoading(false);
        }, 250);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    return { availableInvoices: invoices, loading };
}
