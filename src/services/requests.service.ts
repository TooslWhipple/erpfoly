import { get, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type { OrderDeliveryByOrder } from "@/types/orders.types";

const DELIVERIES_BASE = "/order-deliveries";

export async function getBranchDeliveries(
    orderId: number
): Promise<ApiResult<{ rows: OrderDeliveryByOrder[]; total: number; page: number; limit: number; totalPages: number }>> {
    return get(buildListUrl(DELIVERIES_BASE, { order_id: orderId }));
}
