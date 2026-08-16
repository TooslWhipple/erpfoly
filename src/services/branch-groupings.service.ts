import {
  get,
  post,
  patch,
  type ApiResult,
  type PaginatedRowsResponse,
} from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  CreateBranchGroupingPayload,
  GetBranchGroupingsParams,
  UpdateBranchGroupingPayload,
  BranchGroupingCatalogItem,
  BranchGroupingListItem,
  BranchGroupingAvailableBranch,
} from "@/types/branch-groupings.types";

const BASE = "/branch-groupings";

export type GetBranchGroupingsResponse = PaginatedRowsResponse<BranchGroupingListItem>;

export async function getBranchGroupings(
  params: GetBranchGroupingsParams,
): Promise<ApiResult<GetBranchGroupingsResponse>> {
  return get<GetBranchGroupingsResponse>(buildListUrl(BASE, params));
}

export async function createBranchGrouping(
  payload: CreateBranchGroupingPayload,
): Promise<ApiResult<BranchGroupingListItem>> {
  return post<BranchGroupingListItem>(BASE, payload);
}

export async function updateBranchGrouping(
  id: number,
  payload: UpdateBranchGroupingPayload,
): Promise<ApiResult<BranchGroupingListItem>> {
  return patch<BranchGroupingListItem>(`${BASE}/${id}`, payload);
}

export async function getBranchGroupingsCatalog(): Promise<BranchGroupingCatalogItem[]> {
  const result = await get<BranchGroupingCatalogItem[]>(`${BASE}/catalog`);
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data ?? [];
}

export async function getAvailableBranches(
  excludeGroupId?: number,
): Promise<BranchGroupingAvailableBranch[]> {
  const url = excludeGroupId
    ? `${BASE}/available-branches?excludeGroupId=${excludeGroupId}`
    : `${BASE}/available-branches`;
  const result = await get<BranchGroupingAvailableBranch[]>(url);
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data ?? [];
}
