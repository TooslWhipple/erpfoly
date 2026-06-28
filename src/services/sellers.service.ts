import { get } from "@/lib/axios";
import type { ApiResult, PaginatedRowsResponse } from "@/lib/axios";
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

export async function getSellerDetail(
  sellerId: number
): Promise<ApiResult<SellerDetail>> {
  return get<SellerDetail>(`${SELLERS_BASE}/${sellerId}`);
}
