import { get, post, patch, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  ProductSuggestion,
  CostHistoryEntry,
  CreateOrderPayload,
  CreateOrderResponse,
  OrderListItem,
  OrderFullDetail,
  OrderStats,
  OrderItemByOrder,
  OrderDeliveryByOrder,
  CreateDeliveryWithItemsPayload,
  CreateDeliveryWithItemsResponse,
  QueryOrdersParams,
  QueryOrderItemsParams,
  QueryOrderDeliveriesParams,
  UpdateOrderPayload,
} from "@/types/orders.types";

const ORDERS_BASE = "/orders";
const ORDER_ITEMS_BASE = "/order-items";
const ORDER_DELIVERIES_BASE = "/order-deliveries";
const PRODUCTS_BASE = "/products";

export async function getSuggestionsBySupplier(
  supplierId: number,
  limit = 10
): Promise<ApiResult<ProductSuggestion[]>> {
  return get<ProductSuggestion[]>(`${PRODUCTS_BASE}/suggestions-by-supplier`, {
    params: { supplierId, limit },
  });
}

export async function getProductCostHistory(
  productId: number
): Promise<ApiResult<CostHistoryEntry[]>> {
  return get<CostHistoryEntry[]>(`${PRODUCTS_BASE}/${productId}/cost-history`);
}

export async function createOrder(
  payload: CreateOrderPayload
): Promise<ApiResult<CreateOrderResponse>> {
  return post<CreateOrderResponse>(ORDERS_BASE, payload);
}

export async function createOrderWithItems(
  payload: CreateOrderPayload
): Promise<ApiResult<CreateOrderResponse>> {
  return post<CreateOrderResponse>(`${ORDERS_BASE}/with-items`, payload);
}

export async function updateOrderWithItems(
  id: number,
  payload: UpdateOrderPayload
): Promise<ApiResult<CreateOrderResponse>> {
  return patch<CreateOrderResponse>(`${ORDERS_BASE}/${id}/with-items`, payload);
}

export async function getSuggestions(
  limit = 10
): Promise<ApiResult<ProductSuggestion[]>> {
  return get<ProductSuggestion[]>(`${PRODUCTS_BASE}/suggestions`, {
    params: { limit },
  });
}

export async function getOrders(
  params: QueryOrdersParams
): Promise<ApiResult<{ rows: OrderListItem[]; total: number; page: number; limit: number; totalPages: number }>> {
  return get(buildListUrl(ORDERS_BASE, params));
}

export async function getOrderFull(id: number): Promise<ApiResult<OrderFullDetail>> {
  return get<OrderFullDetail>(`${ORDERS_BASE}/${id}/full`);
}

export async function updateOrderStatus(
  id: number,
  status: string
): Promise<ApiResult<OrderFullDetail>> {
  return patch<OrderFullDetail>(`${ORDERS_BASE}/${id}/status`, { status });
}

export async function getOrderStats(
  branchId?: number
): Promise<ApiResult<OrderStats>> {
  const params = branchId ? { branchId } : undefined;
  return get<OrderStats>(`${ORDERS_BASE}/stats`, { params });
}

export async function getOrderItemsByOrderId(
  orderId: number
): Promise<ApiResult<OrderItemByOrder[]>> {
  return get<OrderItemByOrder[]>(`${ORDER_ITEMS_BASE}/by-order/${orderId}`);
}

export async function getOrderDeliveriesByOrderId(
  orderId: number
): Promise<ApiResult<OrderDeliveryByOrder[]>> {
  return get<OrderDeliveryByOrder[]>(`${ORDER_DELIVERIES_BASE}/by-order/${orderId}`);
}

export async function createDeliveryWithItems(
  payload: CreateDeliveryWithItemsPayload
): Promise<ApiResult<CreateDeliveryWithItemsResponse>> {
  return post<CreateDeliveryWithItemsResponse>(`${ORDER_DELIVERIES_BASE}/with-items`, payload);
}

export async function getOrderDeliveries(
  params: QueryOrderDeliveriesParams
): Promise<ApiResult<{ rows: OrderDeliveryByOrder[]; total: number; page: number; limit: number; totalPages: number }>> {
  return get(buildListUrl(ORDER_DELIVERIES_BASE, params));
}

export async function getOrderItems(
  params: QueryOrderItemsParams
): Promise<ApiResult<{ rows: OrderItemByOrder[]; total: number; page: number; limit: number; totalPages: number }>> {
  return get(buildListUrl(ORDER_ITEMS_BASE, params));
}
