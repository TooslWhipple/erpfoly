// ============================================================================
// TYPES - Merchandise Reception (Recepción de Mercancías)
// ============================================================================

/** Supplier row for "Nueva recepción" side modal (grouped pending orders). */
export interface SupplierWithPendingOrders {
    id: number;
    name: string;
    legalName: string | null;
    pendingOrdersCount: number;
    orderIds: number[];
}

export interface MerchandiseReception {
    id: number;
    warehouse: string;
    orderNumber: string;
    orderCount: number;
    date: string;
    supplier: string;
    status: ReceptionStatus;
    printedLabelsCount: number;
    supplierId: number;
    branchId: number;
    costeoId: number | null;
    invoices: ReceptionDetailInvoice[];
    hasShortage?: boolean;
    originalLabelsIssued?: boolean;
}

/** Detail/edit workflow status on the reception page. */
export type ReceptionDetailStatus =
    | "draft"
    | "pre_authorized"
    | "pre_captured"
    | "in_costing"
    | "costed";

/**
 * UI-facing reception status used in the listing chips.
 * Mirrors the backend `MerchandiseReceptionStatus` enum but keeps the
 * historical "captured" alias for the listing tab filter.
 */
export type ReceptionStatus =
    | "pre_authorized"
    | "pre_captured"
    | "captured"
    | "costed";

export interface ReceptionArticle {
    id: string;
    productId?: number;
    /** ID real del OrderItem (para PATCH/POST). */
    orderItemId?: number;
    name: string;
    sku: string;
    orderId?: number;
    orderNumber: string;
    /** Total solicitado en el pedido. */
    quantity: number;
    orderedQuantity: number;
    /** Tope máximo capturable en esta recepción. */
    pendingQuantity: number;
    /** Tope autorizado por factura (folios preautorizados). */
    authorizedQuantity?: number;
    received: number;
    branchName?: string;
    branchId?: number;
    scheduledDeliveryDate?: string | null;
}

export interface ReceptionDetailInvoice {
    id: number;
    externalId: string;
    date: string;
    paymentType: "PUE" | "PPD";
    origin: "providers" | "administration";
    amount: number;
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
