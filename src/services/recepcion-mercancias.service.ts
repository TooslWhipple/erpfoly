import { get, post, patch } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type { ApiResult, PaginatedRowsResponse } from "@/lib/axios";

const BASE = "/merchandise-receptions";

export type ReceptionStatusApi =
  | "draft"
  | "pre_captured"
  | "in_costing"
  | "costed"
  | "cancelled";

export interface ReceptionListItem {
  id: number;
  warehouse: string;
  orderNumber: string;
  orderCount: number;
  date: string;
  supplier: string;
  status: ReceptionStatusApi;
  printedLabelsCount: number;
  supplierId: number;
  branchId: number;
  costeoId: number | null;
}

export interface ReceptionDetailItem {
  id: number;
  receptionId: number;
  orderId: number;
  orderItemId: number;
  productId: number;
  orderNumber: string;
  sku: string;
  name: string;
  quantity: number;
  received: number;
  branchName: string | null;
  scheduledDeliveryDate: string | null;
}

export interface ReceptionDetailInvoice {
  id: number;
  externalId: string;
  date: string;
  amount: number;
  type: string;
}

export interface ReceptionDetail extends ReceptionListItem {
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  items: ReceptionDetailItem[];
  invoices: ReceptionDetailInvoice[];
  costeo: { id: number } | null;
}

export interface SupplierWithPendingOrdersApi {
  id: number;
  name: string;
  legalName: string | null;
  pendingOrdersCount: number;
  orderIds: number[];
}

export interface PendingArticleApi {
  id: string;
  productId: number;
  name: string;
  sku: string;
  orderId: number;
  orderNumber: string;
  quantity: number;
  received: number;
  unitCost: number | null;
  scheduledDeliveryDate: string | null;
  branchName: string;
  branchId: number;
}

export interface GetReceptionsParams {
  page: number;
  limit: number;
  search?: string;
  status?: "all" | ReceptionStatusApi;
  supplier_id?: number;
  branch_id?: number;
  date_from?: string;
  date_to?: string;
}

export type GetReceptionsResponse = PaginatedRowsResponse<ReceptionListItem>;

export interface CreateReceptionItemPayload {
  order_id: number;
  order_item_id: number;
  product_id: number;
  quantity: number;
  received?: number;
}

export interface CreateReceptionPayload {
  supplier_id: number;
  branch_id: number;
  order_date: string;
  printed_labels_count?: number;
  notes?: string;
  items: CreateReceptionItemPayload[];
}

export interface UpdateReceptionPayload {
  supplier_id?: number;
  branch_id?: number;
  order_date?: string;
  printed_labels_count?: number;
  notes?: string;
  items?: CreateReceptionItemPayload[];
}

export interface SendToCostingItemPayload {
  product_id: number;
  quantity: number;
  received: number;
  unit_cost?: number;
}

export interface SendToCostingInvoicePayload {
  supplier_invoice_id: number;
  amount: number;
}

export interface SendToCostingApiPayload {
  items: SendToCostingItemPayload[];
  invoices?: SendToCostingInvoicePayload[];
}

export interface SendToCostingApiResponse {
  receptionId: number;
  costeoId: number;
}

function serializeListParams(
  params: GetReceptionsParams,
): Record<string, string | number | undefined> {
  const result: Record<string, string | number | undefined> = {
    page: params.page,
    limit: params.limit,
    search: params.search,
  };
  if (params.status && params.status !== "all") {
    result.status = params.status;
  }
  if (params.supplier_id != null) result.supplier_id = params.supplier_id;
  if (params.branch_id != null) result.branch_id = params.branch_id;
  if (params.date_from) result.date_from = params.date_from;
  if (params.date_to) result.date_to = params.date_to;
  return result;
}

export async function getReceptions(
  params: GetReceptionsParams,
): Promise<ApiResult<GetReceptionsResponse>> {
  return get<GetReceptionsResponse>(
    buildListUrl(BASE, serializeListParams(params)),
  );
}

export async function getReceptionById(
  id: number,
): Promise<ApiResult<ReceptionDetail>> {
  return get<ReceptionDetail>(`${BASE}/${id}`);
}

export async function createReception(
  payload: CreateReceptionPayload,
): Promise<ApiResult<ReceptionDetail>> {
  return post<ReceptionDetail>(BASE, payload);
}

export async function updateReception(
  id: number,
  payload: UpdateReceptionPayload,
): Promise<ApiResult<ReceptionDetail>> {
  return patch<ReceptionDetail>(`${BASE}/${id}`, payload);
}

export async function getSuppliersWithPendingOrders(): Promise<
  ApiResult<SupplierWithPendingOrdersApi[]>
> {
  return get<SupplierWithPendingOrdersApi[]>(
    `${BASE}/pending-orders-by-supplier`,
  );
}

export async function getPendingArticlesBySupplier(
  supplierId: number,
): Promise<ApiResult<PendingArticleApi[]>> {
  return get<PendingArticleApi[]>(
    `${BASE}/pending-articles-by-supplier/${supplierId}`,
  );
}

export async function sendReceptionToCosting(
  receptionId: number,
  payload: SendToCostingApiPayload,
): Promise<ApiResult<SendToCostingApiResponse>> {
  return post<SendToCostingApiResponse>(
    `${BASE}/${receptionId}/send-to-costing`,
    payload,
  );
}
