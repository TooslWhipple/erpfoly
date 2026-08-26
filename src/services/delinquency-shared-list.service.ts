import { get, post, request, type ApiResult, type PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  ApplyDelinquencyNegotiationPayload,
  CreateDelinquencySharedListPayload,
  DelinquencySharedListDetail,
  DelinquencySharedListSummary,
  GetDelinquencySharedListsParams,
  SharedDelinquencyClientDetail,
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

export async function getSharedListClientDetail(
  listId: number,
  listClientId: number,
): Promise<ApiResult<SharedDelinquencyClientDetail>> {
  return get<SharedDelinquencyClientDetail>(
    `${SHARED_LISTS_BASE}/${listId}/clients/${listClientId}`,
  );
}

export async function applySharedListNegotiation(
  listId: number,
  listClientId: number,
  payload: ApplyDelinquencyNegotiationPayload,
): Promise<ApiResult<SharedDelinquencyClientDetail>> {
  return post<SharedDelinquencyClientDetail>(
    `${SHARED_LISTS_BASE}/${listId}/clients/${listClientId}/negotiation`,
    payload,
  );
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
