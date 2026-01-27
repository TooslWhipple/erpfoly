// ============================================================================
// TYPES & INTERFACES - Customer Service Module
// ============================================================================

export type SearchType = "facturas" | "clientes" | "pedidos";

export type InvoiceStatus = "activo" | "cancelado" | "pagado";

export type ArticleStatus = "entregado" | "reparacion" | "pendiente" | "cancelado";

export interface InvoiceArticle {
    id: string;
    code: string;
    status: ArticleStatus;
    description: string;
    price: number;
    promotions: number;
    total: number;
    points: number;
}

export interface InvoiceActivity {
    id: string;
    date: string;
    type: "payment" | "adjustment" | "note" | "status_change";
    description: string;
    amount?: number;
}

export interface InvoiceDetail {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    purchaseDate: string;
    status: InvoiceStatus;
    initialCost: number;
    totalPayments: number;
    remaining: number;
    paymentDate: string;
    nextPayment: number;
    currentPayment: number;
    totalPaymentsCount: number;
    articles: InvoiceArticle[];
    activities: InvoiceActivity[];
    summary: {
        subtotalWithoutTax: number;
        tax: number;
        amountWithTax: number;
        luxuryTax: number;
        total: number;
    };
}

export interface SearchResult {
    id: string;
    type: SearchType;
    title: string;
    subtitle?: string;
    metadata?: Record<string, string>;
}
