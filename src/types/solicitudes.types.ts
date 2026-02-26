// ============================================================================
// TYPES - Branch orders (Solicitudes Sucursales)
// ============================================================================

export type BranchOrderStatus = "pending" | "delivered";

export interface BranchOrderLineItem {
    articleId: string;
    articleName: string;
    deliveryDate: string;
    quantity: number;
}

export interface BranchOrderDetail {
    id: number;
    folio: string;
    createdAt: string;
    status: BranchOrderStatus;
    originId: string;
    originLabel: string;
    destinationId: string;
    destinationLabel: string;
    items: BranchOrderLineItem[];
}

export interface BranchOrderDetailParams {
    id: string;
}
