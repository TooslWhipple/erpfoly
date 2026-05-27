export interface DemandData {
  lastYear: number;
  lastMonth: number;
  currentMonth: number;
}

export interface DemandTrendPoint {
  month: string;
  value: number;
}

export interface ProductSuggestion {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  demandData: DemandData;
  trendData: DemandTrendPoint[];
  score: number;
}

export interface CostHistoryEntry {
  id: string;
  date: string;
  price: number;
  changePercentage: number;
  orderId?: string;
  branchName?: string;
}

export interface OrderItemInput {
  product_id: number;
  requested_quantity: number;
  unit_price: number;
  scheduled_delivery_date?: string;
}

export interface UpdateOrderItemInput {
  id?: number;
  product_id: number;
  requested_quantity: number;
  unit_price: number;
  delivered_quantity?: number;
  scheduled_delivery_date?: string;
  notes?: string;
}

export interface CreateOrderPayload {
  order_type: "external" | "internal";
  branch_id: number;
  folio: string;
  order_date: string;
  notes?: string;
  client_id?: number;
  requested_by?: number;
  status?: string;
  items: OrderItemInput[];
}

export interface UpdateOrderPayload {
  order_type?: "external" | "internal";
  branch_id?: number;
  folio?: string;
  order_date?: string;
  notes?: string;
  client_id?: number;
  requested_by?: number;
  status?: string;
  items: UpdateOrderItemInput[];
}

export interface CreateOrderResponse {
  id: number;
  folio: string;
  status: string;
  order_date: string;
  items: Array<{
    id: number;
    product_id: number;
    requested_quantity: number;
  }>;
}

export interface SelectedOrderItem {
  productId: number;
  productCode: string;
  productName: string;
  previewImage: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface QueryOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  order_type?: "external" | "internal";
  status?: string;
  branch_id?: number;
  client_id?: number;
  requested_by?: number;
  date_from?: string;
  date_to?: string;
}

export interface QueryOrderItemsParams {
  page?: number;
  limit?: number;
  order_id?: number;
  product_id?: number;
}

export interface QueryOrderDeliveriesParams {
  page?: number;
  limit?: number;
  order_id?: number;
  received_by?: number;
  date_from?: string;
  date_to?: string;
}

export interface OrderListItem {
  id: number;
  order_type: "external" | "internal";
  folio: string;
  status: string;
  order_date: string;
  notes: string | null;
  branch: { id: number; name: string } | null;
  client: { id: number; first_name: string; last_surname: string } | null;
  requested_by_user: { id: number; first_name: string; last_name: string } | null;
  order_items: Array<{
    id: number;
    requested_quantity: number;
    delivered_quantity: number;
    scheduled_delivery_date: string | null;
    product: { id: number; code: string; short_name: string } | null;
  }>;
}

export interface OrderFullDetail {
  id: number;
  order_type: "external" | "internal";
  folio: string;
  status: string;
  order_date: string;
  notes: string | null;
  created_at: string;
  branch: { id: number; name: string } | null;
  client: { id: number; first_name: string; last_surname: string; phone_number: string | null } | null;
  requested_by_user: { id: number; first_name: string; last_name: string; username: string } | null;
  order_items: Array<{
    id: number;
    requested_quantity: number;
    unit_price: number;
    delivered_quantity: number;
    scheduled_delivery_date: string | null;
    notes: string | null;
    product: {
      id: number;
      code: string;
      short_name: string;
      list_cost: number | null;
      product_images: Array<{ image_url: string }>;
      product_suppliers: Array<{ supplier_id: number }>;
    } | null;
  }>;
  order_deliveries: Array<{
    id: number;
    delivery_date: string;
    received_by_user: { id: number; first_name: string; last_name: string } | null;
    order_delivery_items: Array<{
      id: number;
      quantity: number;
      order_item: {
        id: number;
        requested_quantity: number;
        product: { id: number; code: string; short_name: string } | null;
      };
    }>;
  }>;
}

export interface OrderStats {
  total: number;
  pending: number;
  partiallyDelivered: number;
  delivered: number;
  cancelled: number;
}

export interface OrderItemByOrder {
  id: number;
  order_id: number;
  product_id: number;
  requested_quantity: number;
  delivered_quantity: number;
  notes: string | null;
  product: { id: number; code: string; short_name: string } | null;
  order?: { id: number; folio: string; status: string } | null;
}

export interface OrderDeliveryByOrder {
  id: number;
  order_id: number;
  delivery_date: string;
  received_by_user: { id: number; first_name: string; last_name: string } | null;
  order_delivery_items: Array<{
    id: number;
    quantity: number;
    order_item: {
      id: number;
      requested_quantity: number;
      product: { id: number; code: string; short_name: string } | null;
    };
  }>;
}

export interface CreateDeliveryWithItemsPayload {
  order_id: number;
  delivery_date: string;
  received_by?: number;
  notes?: string;
  items: Array<{
    order_item_id: number;
    quantity: number;
  }>;
}

export interface CreateDeliveryWithItemsResponse {
  id: number;
  order_id: number;
  delivery_date: string;
  items: Array<{
    id: number;
    order_item_id: number;
    quantity: number;
  }>;
}
