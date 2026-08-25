import { get, post, request, type ApiResult, type PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  CreateDelinquencySharedListPayload,
  DelinquencySharedListDetail,
  DelinquencySharedListSummary,
  GetDelinquencySharedListsParams,
} from "@/types/delinquency-shared-list.types";

const SHARED_LISTS_BASE = "/clients/delinquency/shared-lists";

export async function createDelinquencySharedList(
  payload: CreateDelinquencySharedListPayload,
): Promise<ApiResult<DelinquencySharedListDetail>> {
  return post<DelinquencySharedListDetail>(SHARED_LISTS_BASE, payload);
}

export async function getDelinquencySharedLists(
  params: GetDelinquencySharedListsParams,
): Promise<ApiResult<PaginatedRowsResponse<DelinquencySharedListSummary>>> {
  return get<PaginatedRowsResponse<DelinquencySharedListSummary>>(
    buildListUrl(SHARED_LISTS_BASE, params),
  );
}

export async function getDelinquencySharedListById(
  id: number,
): Promise<ApiResult<DelinquencySharedListDetail>> {
  return get<DelinquencySharedListDetail>(`${SHARED_LISTS_BASE}/${id}`);
}

export async function addDelinquencySharedListAccess(
  id: number,
  emails: string[],
): Promise<ApiResult<DelinquencySharedListDetail>> {
  return post<DelinquencySharedListDetail>(`${SHARED_LISTS_BASE}/${id}/access`, {
    emails,
  });
}

export async function removeDelinquencySharedListAccess(
  id: number,
  email: string,
): Promise<ApiResult<DelinquencySharedListDetail>> {
  return request<DelinquencySharedListDetail>(
    "DELETE",
    `${SHARED_LISTS_BASE}/${id}/access`,
    { email },
  );
}
