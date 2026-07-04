import type { OrderListItem, OrderFullDetail, QueryOrdersParams, UpdateOrderPayload } from "@/types/orders.types";

export type BranchOrderStatus =
    | "pending"
    | "scheduled"
    | "partially_delivered"
    | "delivered"
    | "cancelled";

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

export interface QueryBranchRequestsParams extends QueryOrdersParams {}

export interface BranchRequestListItem extends OrderListItem {}

export interface BranchRequestFullDetail extends OrderFullDetail {}

export interface ScheduleBranchRequestPayload {
    items: Array<{
        order_item_id: number;
        scheduled_delivery_date: string;
    }>;
    notes?: string;
}

export interface UpdateBranchRequestPayload extends UpdateOrderPayload {}
