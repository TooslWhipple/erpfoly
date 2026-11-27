import { get, patch } from "@/lib/axios";
import type { ApiResult, ApiSuccessPayload, PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type { SellerDetail, SellerListItem } from "@/types/sellers.types";

export interface GetSellersParams {
  page: number;
  limit: number;
  search?: string;
}

export type GetSellersResponse = PaginatedRowsResponse<SellerListItem>;

const SELLERS_BASE = "/users/sellers";

export async function getSellers(
  params: GetSellersParams
): Promise<ApiResult<GetSellersResponse>> {
  return get<GetSellersResponse>(buildListUrl(SELLERS_BASE, params));
}

/** Without `period` the API reports the current month. */
export async function getSellerDetail(
  sellerId: number,
  period?: { year: number; month: number }
): Promise<ApiResult<SellerDetail>> {
  const query = period
    ? `?${new URLSearchParams({
        year: String(period.year),
        month: String(period.month),
      })}`
    : "";
  return get<SellerDetail>(`${SELLERS_BASE}/${sellerId}${query}`);
}

export async function updateSellerBranch(
  sellerId: number,
  branchId: number
): Promise<ApiResult<ApiSuccessPayload>> {
  return patch<ApiSuccessPayload>(`${SELLERS_BASE}/${sellerId}/branch`, {
    branchId,
  });
}
