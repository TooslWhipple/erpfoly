import { get, post, patch, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  ProductSuggestion,
  CostHistoryEntry,
  ProductSupplierPurchaseContext,
  PurchaseHistoryEntry,
  UpdateAgreedPricePayload,
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
  OrderAdjustmentContext,
  AdjustOrderPayload,
  CloseOrderPayload,
  OrderActionResponse,
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

interface PurchaseHistoryApiEntry {
  id: string;
  date: string;
  price: number;
  changePercentage: number;
  orderId: number;
  orderFolio: string;
}

interface ProductSupplierPurchaseContextApi {
  agreedUnitPrice: number | null;
  agreedPriceValidUntil: string | null;
  isAgreedPriceValid: boolean;
  suggestedUnitPrice: number | null;
  purchaseHistory: PurchaseHistoryApiEntry[];
}

function mapPurchaseHistoryEntry(row: PurchaseHistoryApiEntry): PurchaseHistoryEntry {
  const changePercentage = Number(row.changePercentage) || 0;
  return {
    id: String(row.id),
    date: row.date,
    price: Number(row.price) || 0,
    changePercentage,
    changeType: changePercentage < 0 ? "decrease" : "increase",
    orderId: Number(row.orderId),
    orderFolio: row.orderFolio,
  };
}

function mapPurchaseContext(
  row: ProductSupplierPurchaseContextApi,
): ProductSupplierPurchaseContext {
  return {
    agreedUnitPrice:
      row.agreedUnitPrice == null ? null : Number(row.agreedUnitPrice),
    agreedPriceValidUntil: row.agreedPriceValidUntil,
    isAgreedPriceValid: Boolean(row.isAgreedPriceValid),
    suggestedUnitPrice:
      row.suggestedUnitPrice == null ? null : Number(row.suggestedUnitPrice),
    purchaseHistory: (row.purchaseHistory ?? []).map(mapPurchaseHistoryEntry),
  };
}

export async function getProductSupplierPurchaseContext(
  productId: number,
  supplierId: number,
  options?: { excludeOrderId?: number },
): Promise<ApiResult<ProductSupplierPurchaseContext>> {
  const result = await get<ProductSupplierPurchaseContextApi>(
    `${PRODUCTS_BASE}/${productId}/suppliers/${supplierId}/purchase-context`,
    {
      params: {
        ...(options?.excludeOrderId
          ? { excludeOrderId: options.excludeOrderId }
          : {}),
      },
    },
  );
  if (result.error || !result.data) {
    return { data: null, error: result.error };
  }
  return { data: mapPurchaseContext(result.data), error: null };
}

export async function updateProductSupplierAgreedPrice(
  productId: number,
  supplierId: number,
  payload: UpdateAgreedPricePayload,
): Promise<ApiResult<ProductSupplierPurchaseContext>> {
  const result = await patch<ProductSupplierPurchaseContextApi>(
    `${PRODUCTS_BASE}/${productId}/suppliers/${supplierId}/agreed-price`,
    payload,
    { skipGlobalErrorToast: true },
  );
  if (result.error || !result.data) {
    return { data: null, error: result.error };
  }
  return { data: mapPurchaseContext(result.data), error: null };
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

/** Los errores de las acciones se muestran en el propio diálogo, no como toast global. */
const ACTION_CONFIG = { skipGlobalErrorToast: true } as const;

export async function getOrderAdjustmentContext(
  id: number
): Promise<ApiResult<OrderAdjustmentContext>> {
  return get<OrderAdjustmentContext>(`${ORDERS_BASE}/${id}/adjustment-context`);
}

export async function adjustOrder(
  id: number,
  payload: AdjustOrderPayload
): Promise<ApiResult<OrderActionResponse>> {
  return patch<OrderActionResponse>(`${ORDERS_BASE}/${id}/adjust`, payload, ACTION_CONFIG);
}

export async function closeOrderRemainder(
  id: number,
  payload: CloseOrderPayload
): Promise<ApiResult<OrderActionResponse>> {
  return patch<OrderActionResponse>(`${ORDERS_BASE}/${id}/close`, payload, ACTION_CONFIG);
}
