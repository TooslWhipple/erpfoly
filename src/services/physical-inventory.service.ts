import { get, patch, post, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  PaginatedListParams,
  PaginatedListPayload,
} from "@/hooks/usePaginatedList";
import type {
  CreatePhysicalInventoryPayload,
  HasVarianceFilter,
  PhysicalInventoryBranchProduct,
  PhysicalInventoryBranchProductsResponse,
  PhysicalInventoryDetail,
  PhysicalInventoryListItem,
  PhysicalInventoryRecordType,
  PhysicalInventoryStatus,
  StartPhysicalInventorySessionPayload,
  StartPhysicalInventorySessionResponse,
  SyncPhysicalInventoryItemsPayload,
  UnifyPhysicalInventoriesPayload,
} from "@/types/physical-inventory.types";

const BASE = "/physical-inventories";

export type GetPhysicalInventoriesResponse =
  PaginatedListPayload<PhysicalInventoryListItem>;

export async function getPhysicalInventories(
  params: PaginatedListParams,
): Promise<ApiResult<GetPhysicalInventoriesResponse>> {
  const branchId = params.branchId as number | undefined;
  const dateFrom = params.dateFrom as string | undefined;
  const dateTo = params.dateTo as string | undefined;
  const hasMissing = params.hasMissing as HasVarianceFilter | undefined;
  const hasSurplus = params.hasSurplus as HasVarianceFilter | undefined;
  const status = params.status as PhysicalInventoryStatus | undefined;
  const recordType = params.recordType as
    | PhysicalInventoryRecordType
    | undefined;
  const unifiableOnly = params.unifiableOnly as boolean | undefined;

  return get<GetPhysicalInventoriesResponse>(
    buildListUrl(BASE, {
      page: params.page,
      limit: params.limit,
      search: params.search,
      branchId: branchId && branchId > 0 ? branchId : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      hasMissing:
        hasMissing && hasMissing !== "all" ? hasMissing : undefined,
      hasSurplus:
        hasSurplus && hasSurplus !== "all" ? hasSurplus : undefined,
      status: status || undefined,
      recordType: recordType || undefined,
      unifiableOnly:
        unifiableOnly === true ? true : undefined,
    }),
  );
}

export async function getPhysicalInventoryDetail(
  id: string | number,
): Promise<ApiResult<PhysicalInventoryDetail>> {
  return get<PhysicalInventoryDetail>(`${BASE}/${id}`);
}

export interface GetPhysicalInventoryBranchProductsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getPhysicalInventoryBranchProducts(
  branchId: number,
  params: GetPhysicalInventoryBranchProductsParams = {},
): Promise<ApiResult<PhysicalInventoryBranchProductsResponse>> {
  return get<PhysicalInventoryBranchProductsResponse>(
    buildListUrl(`${BASE}/branches/${branchId}/products`, {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      search: params.search,
    }),
  );
}

export async function getPhysicalInventoryBranchProductByCode(
  branchId: number,
  code: string,
): Promise<ApiResult<PhysicalInventoryBranchProduct>> {
  return get<PhysicalInventoryBranchProduct>(
    buildListUrl(`${BASE}/branches/${branchId}/products/by-code`, { code }),
  );
}

export async function startPhysicalInventorySession(
  payload: StartPhysicalInventorySessionPayload,
): Promise<ApiResult<StartPhysicalInventorySessionResponse>> {
  return post<StartPhysicalInventorySessionResponse>(
    `${BASE}/sessions`,
    payload,
  );
}

export async function syncPhysicalInventoryItems(
  sessionId: number,
  payload: SyncPhysicalInventoryItemsPayload,
): Promise<ApiResult<{ id: number; synced: number }>> {
  return patch<{ id: number; synced: number }>(
    `${BASE}/${sessionId}/items`,
    payload,
  );
}

export async function finalizePhysicalInventorySession(
  sessionId: number,
): Promise<ApiResult<{ id: number }>> {
  return post<{ id: number }>(`${BASE}/${sessionId}/finalize`, {});
}

export async function unifyPhysicalInventories(
  payload: UnifyPhysicalInventoriesPayload,
): Promise<ApiResult<{ id: number }>> {
  return post<{ id: number }>(`${BASE}/unify`, payload);
}

/** @deprecated Prefer start + sync + finalize */
export async function createPhysicalInventory(
  payload: CreatePhysicalInventoryPayload,
): Promise<ApiResult<{ id: number }>> {
  return post<{ id: number }>(BASE, payload);
}
