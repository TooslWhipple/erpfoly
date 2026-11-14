import { get, patch, post, type ApiResult, type PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  ApplyDelinquencyNegotiationPayload,
  CreateDelinquencySharedListPayload,
  CreateDelinquencySharedListResponse,
  DelinquencySharedListClientSnapshot,
  DelinquencySharedListDashboard,
  DelinquencySharedListDetail,
  DelinquencySharedListSummary,
  GetDelinquencySharedListsParams,
  SharedListCollectorOption,
  SharedDelinquencyClientDetail,
  UpdateDelinquencyManagementStatusPayload,
} from "@/types/delinquency-shared-list.types";

const SHARED_LISTS_BASE = "/clients/delinquency/shared-lists";

export async function createDelinquencySharedList(
  payload: CreateDelinquencySharedListPayload,
): Promise<ApiResult<CreateDelinquencySharedListResponse>> {
  return post<CreateDelinquencySharedListResponse>(SHARED_LISTS_BASE, payload);
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

export async function getSharedListCollectors(): Promise<
  ApiResult<SharedListCollectorOption[]>
> {
  return get<SharedListCollectorOption[]>(`${SHARED_LISTS_BASE}/collectors`);
}

export async function reassignSharedListCollector(
  listId: number,
  payload: { collectorUserId: number },
): Promise<ApiResult<DelinquencySharedListSummary>> {
  return patch<DelinquencySharedListSummary>(
    `${SHARED_LISTS_BASE}/${listId}/collector`,
    payload,
    { skipGlobalErrorToast: true },
  );
}

export async function closeSharedList(
  listId: number,
): Promise<ApiResult<DelinquencySharedListSummary>> {
  return post<DelinquencySharedListSummary>(`${SHARED_LISTS_BASE}/${listId}/close`);
}

export async function getSharedListDashboard(
  listId: number,
  range: { from: string; to: string },
): Promise<ApiResult<DelinquencySharedListDashboard>> {
  return get<DelinquencySharedListDashboard>(
    buildListUrl(`${SHARED_LISTS_BASE}/${listId}/dashboard`, range),
  );
}

export async function updateSharedListClientManagementStatus(
  listId: number,
  listClientId: number,
  payload: UpdateDelinquencyManagementStatusPayload,
): Promise<ApiResult<DelinquencySharedListClientSnapshot>> {
  return patch<DelinquencySharedListClientSnapshot>(
    `${SHARED_LISTS_BASE}/${listId}/clients/${listClientId}/management-status`,
    payload,
  );
}
