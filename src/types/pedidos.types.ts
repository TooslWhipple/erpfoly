// ============================================================================
// TYPES - Orders (Pedidos)
// ============================================================================

export interface Supplier {
    id: string;
    name: string;
}

export interface Article {
    id: string;
    name: string;
    folio: string;
    salesYear: number;
    salesLastMonth: number;
    salesCurrentMonth: number;
    inRepair: number;
    stock: number;
    pendingSupply: number;
}

export interface OrderItem {
    articleId: string;
    articleName: string;
    folio: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface NewOrder {
    supplierId: string;
    supplierName: string;
    items: OrderItem[];
    total: number;
}
