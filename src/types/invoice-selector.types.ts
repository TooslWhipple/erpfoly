export interface SelectableInvoice {
    id: string;
    externalId: string;
    date: string;
    amount: number;
    paymentType?: string;
    origin?: string;
}
