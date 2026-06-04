import { get, patch, post, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type { PaginatedRowsResponse } from "@/lib/axios";
import type {
  GetQuotationsParams,
  QuotationDetail,
  QuotationListItem,
  RequestDiscountPayload,
} from "@/types/cotizaciones.types";
import type { CartItem, SalePaymentType } from "@/types/ventas.types";

const BASE = "/pos/quotations";

export type GetQuotationsResponse = PaginatedRowsResponse<QuotationListItem>;

export async function getQuotations(
  params: GetQuotationsParams
): Promise<ApiResult<GetQuotationsResponse>> {
  return get<GetQuotationsResponse>(buildListUrl(BASE, params));
}

export async function getQuotationDetail(
  id: number
): Promise<ApiResult<QuotationDetail>> {
  return get<QuotationDetail>(`${BASE}/${id}`);
}

export interface UpdateQuotationPayload {
  paymentType?: SalePaymentType;
  items?: Array<{ productId: number; quantity: number; sources: CartItem["sources"] }>;
  clientId?: number | null;
  folypuntosEnabled?: boolean;
}

export async function updateQuotation(
  id: number,
  payload: UpdateQuotationPayload
): Promise<ApiResult<QuotationDetail>> {
  return patch<QuotationDetail>(`${BASE}/${id}`, payload);
}

export async function requestQuotationDiscount(
  id: number,
  payload: RequestDiscountPayload
): Promise<ApiResult<{ success: boolean; message: string }>> {
  return post<{ success: boolean; message: string }>(
    `${BASE}/${id}/discount-request`,
    payload
  );
}

export async function convertQuotationToSale(
  id: number
): Promise<ApiResult<{ saleId: number; folio: string }>> {
  return post<{ saleId: number; folio: string }>(`${BASE}/${id}/convert`, {});
}
