import { api, get, patch, post, unwrapOrThrow } from "@/lib/axios";
import type { ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  PaginatedListParams,
  PaginatedListPayload,
} from "@/hooks/usePaginatedList";
import type {
  ReceiveRecoveryItemPayload,
  RecoverySheetDetail,
  RecoverySheetListItem,
  RecoverySheetOriginFilter,
  RecoverySheetStatus,
} from "@/types/recovery-sheets.types";

export type GetRecoverySheetsResponse =
  PaginatedListPayload<RecoverySheetListItem>;

export async function getRecoverySheets(
  params: PaginatedListParams,
): Promise<ApiResult<GetRecoverySheetsResponse>> {
  const originFilter = params.originFilter as
    | RecoverySheetOriginFilter
    | undefined;
  return get<GetRecoverySheetsResponse>(
    buildListUrl("/recovery-sheets", {
      page: params.page,
      limit: params.limit,
      search: params.search,
      status:
        typeof params.statusTab === "string" && params.statusTab !== "all"
          ? params.statusTab
          : undefined,
      origin:
        originFilter && originFilter !== "all" ? originFilter : undefined,
    }),
  );
}

export async function getRecoverySheetDetail(
  id: string,
): Promise<ApiResult<RecoverySheetDetail>> {
  return get<RecoverySheetDetail>(`/recovery-sheets/${id}`);
}

export async function updateRecoverySheetStatus(
  id: string,
  status: RecoverySheetStatus,
): Promise<ApiResult<RecoverySheetDetail>> {
  return patch<RecoverySheetDetail>(`/recovery-sheets/${id}/status`, {
    status,
  });
}

export async function receiveRecoveryItem(
  id: string,
  payload: ReceiveRecoveryItemPayload,
): Promise<ApiResult<RecoverySheetDetail>> {
  return post<RecoverySheetDetail>(`/recovery-sheets/${id}/receive`, {
    branchId: payload.branchId,
    itemCondition: payload.itemCondition,
    receivedDate: payload.receivedDate,
  });
}

export async function searchRecoverySheets(
  query: string,
): Promise<RecoverySheetListItem[]> {
  const result = await getRecoverySheets({
    page: 1,
    limit: 20,
    search: query,
  });
  return result.data?.rows ?? [];
}

export async function downloadRecoverySheetPdf(id: string): Promise<void> {
  const response = await api.get(`/recovery-sheets/${id}/pdf`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `HR-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export { unwrapOrThrow };
