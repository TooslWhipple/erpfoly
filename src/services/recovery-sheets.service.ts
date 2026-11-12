import axios from "axios";
import {
  api,
  get,
  patch,
  post,
  unwrapOrThrow,
  type AxiosConfigWithSkipToast,
} from "@/lib/axios";
import type { ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import { downloadBlob } from "@/lib/printing";
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

async function blobFromPdfResponse(
  data: unknown,
  fallbackMessage: string,
): Promise<Blob> {
  if (data instanceof Blob) {
    const looksJson =
      data.type.includes("application/json") || data.type.includes("text/plain");
    if (looksJson) {
      const text = await data.text();
      try {
        const json = JSON.parse(text) as {
          error?: { message?: string };
          message?: string;
        };
        throw new Error(json.error?.message ?? json.message ?? fallbackMessage);
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error(fallbackMessage);
        }
        throw error;
      }
    }
    return data.type.includes("pdf")
      ? data
      : new Blob([data], { type: "application/pdf" });
  }

  return new Blob([data as BlobPart], { type: "application/pdf" });
}

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

export async function fetchRecoverySheetPdf(
  id: string,
): Promise<{ blob: Blob; filename: string }> {
  const fallbackMessage = "No se pudo cargar la hoja de recuperación.";
  const response = await api.get(`/recovery-sheets/${id}/pdf`, {
    responseType: "blob",
    skipGlobalErrorToast: true,
  } as AxiosConfigWithSkipToast);

  const blob = await blobFromPdfResponse(response.data, fallbackMessage);
  const contentDisposition = response.headers["content-disposition"] as
    | string
    | undefined;
  const match = contentDisposition?.match(/filename="?([^";]+)"?/);
  const filename = match?.[1] || `HR-${id}.pdf`;
  return { blob, filename };
}

export async function downloadRecoverySheetPdf(id: string): Promise<void> {
  const fallbackMessage = "No se pudo descargar la hoja de recuperación.";
  try {
    const { blob, filename } = await fetchRecoverySheetPdf(id);
    downloadBlob(blob, filename);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      await blobFromPdfResponse(error.response.data, fallbackMessage);
    }
    throw error instanceof Error && error.message.trim()
      ? error
      : new Error(fallbackMessage);
  }
}

export { unwrapOrThrow };
