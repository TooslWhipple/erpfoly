export type BranchOrderStatus =
    | "pending"
    | "scheduled"
    | "shipped"
    | "partially_delivered"
    | "in_progress"
    | "delivered"
    | "cancelled"
    | "unknown";

export interface BranchOrderLineItem {
    articleId: string;
    articleName: string;
    deliveryDate: string;
    quantity: number;
    scheduledDeliveryDate: string | null;
    orderItemId: number;
    productId: number;
    requestedQuantity: number;
    deliveredQuantity: number;
    shippedQuantity: number | null;
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

export interface ScheduleBranchRequestPayload {
    items: Array<{
        order_item_id: number;
        scheduled_delivery_date: string;
    }>;
    notes?: string;
}

