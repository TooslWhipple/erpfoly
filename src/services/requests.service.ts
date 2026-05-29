import { get, patch, post, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
    QueryBranchRequestsParams,
    BranchRequestListItem,
    BranchRequestFullDetail,
    ScheduleBranchRequestPayload,
    UpdateBranchRequestPayload,
} from "@/types/solicitudes.types";
import type { CreateDeliveryWithItemsPayload, CreateDeliveryWithItemsResponse, OrderDeliveryByOrder } from "@/types/orders.types";

const REQUESTS_BASE = "/orders";
const DELIVERIES_BASE = "/order-deliveries";

export async function getBranchRequests(
    params: QueryBranchRequestsParams
): Promise<ApiResult<{ rows: BranchRequestListItem[]; total: number; page: number; limit: number; totalPages: number }>> {
    return get(buildListUrl(REQUESTS_BASE, { ...params, order_type: "internal" }));
}

export async function getBranchRequestFull(id: number): Promise<ApiResult<BranchRequestFullDetail>> {
    return get<BranchRequestFullDetail>(`${REQUESTS_BASE}/${id}/full`);
}

export async function updateBranchRequest(
    id: number,
    payload: UpdateBranchRequestPayload
): Promise<ApiResult<{ id: number; folio: string; status: string; order_date: string; items: Array<{ id: number; product_id: number; requested_quantity: number }> }>> {
    return patch(`${REQUESTS_BASE}/${id}/with-items`, payload);
}

export async function scheduleBranchRequest(
    id: number,
    payload: ScheduleBranchRequestPayload
): Promise<ApiResult<{ id: number; folio: string; status: string; items: Array<{ id: number; product_id: number; requested_quantity: number; scheduled_delivery_date: Date | null }> }>> {
    return patch(`${REQUESTS_BASE}/${id}/schedule`, payload);
}

export async function createBranchDelivery(
    payload: CreateDeliveryWithItemsPayload
): Promise<ApiResult<CreateDeliveryWithItemsResponse>> {
    return post(`${DELIVERIES_BASE}/with-items`, payload);
}

export async function getBranchDeliveries(
    orderId: number
): Promise<ApiResult<{ rows: OrderDeliveryByOrder[]; total: number; page: number; limit: number; totalPages: number }>> {
    return get(buildListUrl(DELIVERIES_BASE, { order_id: orderId }));
}
