// ============================================================================
// TYPES - Merchandise Reception (Recepción de Mercancías)
// ============================================================================

export interface OrderToReceive {
    id: string;
    sku: string;
    supplier: string;
    deliveryDate: string;
    total: number;
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

export type ReceptionStatus = "pre_captured" | "captured" | "costed";

export interface ReceptionArticle {
    id: string;
    name: string;
    sku: string;
    orderNumber: string;
    quantity: number; // Cantidad pedida
    received: number; // Cantidad recibida
}

export interface NewReceptionData {
    supplier: string;
    supplierId: string;
    orderDate: string;
    deliveryDate: string;
    branch: string;
    articles: ReceptionArticle[];
}
