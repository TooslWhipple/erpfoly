// ============================================================================
// TYPES - Merchandise Reception (Recepción de Mercancías)
// ============================================================================

export interface OrderToReceive {
    id: string;
    sku: string;
    supplier: string;
    /** Legal / business name shown under the supplier brand in selection UI. */
    supplierLegalName?: string;
    deliveryDate: string;
    total: number;
}

/** Supplier row for "Nueva recepción" side modal (grouped pending orders). */
export interface SupplierWithPendingOrders {
    id: string;
    name: string;
    legalName: string;
    pendingOrdersCount: number;
    orderIds: string[];
}

export interface MerchandiseReception {
    id: number;
    warehouse: string;
    orderNumber: string;
    date: string;
    supplier: string;
    total: number;
    status: ReceptionStatus;
    receptionDate: string;
}

/** Detail/edit workflow status on the reception page. */
export type ReceptionDetailStatus = "draft" | "pre_captured" | "in_costing" | "costed";

export type ReceptionStatus = "pre_captured" | "captured" | "costed";

export interface ReceptionArticle {
    id: string;
    name: string;
    sku: string;
    orderNumber: string;
    quantity: number;
    received: number;
    /** Unit cost used for invoice amount comparison (mock / API). */
    unitCost?: number;
}

export interface ReceptionInvoice {
    id: string;
    fiscalFolio: string;
    date: string;
    amount: number;
    origin?: string;
    paymentType?: string;
}

export interface NewReceptionData {
    supplier: string;
    supplierId: string;
    orderDate: string;
    deliveryDate: string;
    branch: string;
    articles: ReceptionArticle[];
}
