import { get, post, del } from "@/lib/axios";
import { unwrapOrThrow } from "@/lib/axios";
import type { ApiResult, PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  SaleListItem,
  GetSalesParams,
  ProductSearchResult,
  ProductDetail,
  SaleDetail,
  DeliveryAvailabilityItem,
  SetDeliveryDatePayload,
} from "@/types/ventas.types";

export type { SaleListItem, GetSalesParams };

const BASE = "/pos";

export type GetSalesResponse = PaginatedRowsResponse<SaleListItem>;

export async function getSales(
  params: GetSalesParams
): Promise<ApiResult<GetSalesResponse>> {
  return get<GetSalesResponse>(buildListUrl(`${BASE}/sales`, params));
}

export interface SearchProductsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export type SearchProductsResponse = PaginatedRowsResponse<ProductSearchResult>;

export async function searchProducts(
  params: SearchProductsParams
): Promise<ApiResult<SearchProductsResponse>> {
  return get<SearchProductsResponse>(
    buildListUrl(`${BASE}/products/search`, params)
  );
}

export async function getProductDetail(
  productId: number,
  currentBranchId?: number,
  includeOthers?: boolean,
): Promise<ApiResult<ProductDetail>> {
  const params = new URLSearchParams();
  if (currentBranchId !== undefined) {
    params.set("currentBranchId", String(currentBranchId));
  }
  if (includeOthers) {
    params.set("includeOthers", "true");
  }
  const query = params.toString();
  return get<ProductDetail>(
    `${BASE}/products/${productId}/detail${query ? `?${query}` : ""}`
  );
}

export interface PurchaseType {
  id: number;
  code: string;
  name: string;
}

export async function getPurchaseTypes(): Promise<ApiResult<PurchaseType[]>> {
  return get<PurchaseType[]>(`${BASE}/purchase-types`);
}

export interface CreateSaleDraftPayload {
  branch_id: number;
  purchase_type_id: number;
  client_id?: number;
  origin: "STORE" | "ONLINE" | "PHONE";
  notes?: string;
}

export async function createSaleDraft(
  payload: CreateSaleDraftPayload
): Promise<ApiResult<{ id: number; folio: string }>> {
  return post<{ id: number; folio: string }>(`${BASE}/sales`, payload);
}

export interface AddSaleItemPayload {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
}

export async function addSaleItem(
  saleId: number,
  payload: AddSaleItemPayload
): Promise<ApiResult<unknown>> {
  return post<unknown>(`${BASE}/sales/${saleId}/items`, payload);
}

export interface RegisterPaymentPayload {
  payment_method: "CASH" | "CARD" | "TRANSFER";
  amount: number;
  received_amount?: number;
  change_amount?: number;
}

export async function registerSalePayment(
  saleId: number,
  payload: RegisterPaymentPayload
): Promise<ApiResult<unknown>> {
  return post<unknown>(`${BASE}/sales/${saleId}/payments`, payload);
}

export async function confirmSalePayment(
  saleId: number
): Promise<ApiResult<{ id: number; folio: string; status: string }>> {
  return post<{ id: number; folio: string; status: string }>(
    `${BASE}/sales/${saleId}/confirm`
  );
}

export interface ConfirmCreditSalePayload {
  term_months: number;
  down_payment: number;
  payment_method: "CASH" | "CARD";
}

export async function confirmCreditSale(
  saleId: number,
  payload: ConfirmCreditSalePayload
): Promise<ApiResult<{ id: number; folio: string; status: string }>> {
  return post<{ id: number; folio: string; status: string }>(
    `${BASE}/sales/${saleId}/confirm-credit`,
    payload
  );
}

export async function getSaleDetail(
  saleId: number
): Promise<ApiResult<SaleDetail>> {
  return get<SaleDetail>(`${BASE}/sales/${saleId}`);
}

export async function getDeliveryAvailability(
  month: number,
  year: number,
  branchId?: number
): Promise<DeliveryAvailabilityItem[]> {
  const params = new URLSearchParams({
    month: String(month),
    year: String(year),
  });
  if (branchId) params.append("branch_id", String(branchId));
  return unwrapOrThrow(
    await get<DeliveryAvailabilityItem[]>(
      `${BASE}/delivery-availability?${params.toString()}`
    )
  );
}

export async function setDeliveryDate(
  saleId: number,
  payload: SetDeliveryDatePayload
): Promise<{ id: number; delivery_date: string }> {
  return unwrapOrThrow(
    await post<{ id: number; delivery_date: string }>(
      `${BASE}/sales/${saleId}/delivery-date`,
      payload
    )
  );
}

export async function removeDeliveryDate(
  saleId: number
): Promise<void> {
  return unwrapOrThrow(
    await del<void>(`${BASE}/sales/${saleId}/delivery-date`)
  );
}

export async function getEstimatedDeliveryDate(
  branchId: number
): Promise<{ estimatedDeliveryDate: string | null }> {
  return unwrapOrThrow(
    await get<{ estimatedDeliveryDate: string | null }>(
      `${BASE}/branches/${branchId}/estimated-delivery-date`
    )
  );
}
