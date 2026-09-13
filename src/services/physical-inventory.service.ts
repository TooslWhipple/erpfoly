import { get, post, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  PaginatedListParams,
  PaginatedListPayload,
} from "@/hooks/usePaginatedList";
import type {
  CreatePhysicalInventoryPayload,
  HasVarianceFilter,
  PhysicalInventoryBranchProductsResponse,
  PhysicalInventoryDetail,
  PhysicalInventoryListItem,
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
    }),
  );
}

export async function getPhysicalInventoryDetail(
  id: string | number,
): Promise<ApiResult<PhysicalInventoryDetail>> {
  return get<PhysicalInventoryDetail>(`${BASE}/${id}`);
}

export async function getPhysicalInventoryBranchProducts(
  branchId: number,
): Promise<ApiResult<PhysicalInventoryBranchProductsResponse>> {
  return get<PhysicalInventoryBranchProductsResponse>(
    `${BASE}/branches/${branchId}/products`,
  );
}

export async function createPhysicalInventory(
  payload: CreatePhysicalInventoryPayload,
): Promise<ApiResult<{ id: number }>> {
  return post<{ id: number }>(BASE, payload);
}
