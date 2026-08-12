import type { ApiResult } from "@/lib/axios";
import type {
  PaginatedListParams,
  PaginatedListPayload,
} from "@/hooks/usePaginatedList";
import {
  getMockRecoverySheetDetail,
  getMockRecoverySheets,
  receiveMockRecoveryItem,
  searchMockRecoverySheets,
  updateMockRecoverySheetStatus,
} from "@/data/recovery-sheets.mockData";
import type {
  ReceiveRecoveryItemPayload,
  RecoverySheetDetail,
  RecoverySheetListItem,
  RecoverySheetOriginFilter,
  RecoverySheetStatus,
} from "@/types/recovery-sheets.types";

function ok<T>(data: T): ApiResult<T> {
  return { data, error: null };
}

function fail<T>(message: string): ApiResult<T> {
  return { data: null, error: { message } };
}

export type GetRecoverySheetsResponse =
  PaginatedListPayload<RecoverySheetListItem>;

export async function getRecoverySheets(
  params: PaginatedListParams,
): Promise<ApiResult<GetRecoverySheetsResponse>> {
  try {
    const statusTab =
      typeof params.statusTab === "string" ? params.statusTab : "all";
    const originFilter = params.originFilter as
      | RecoverySheetOriginFilter
      | undefined;

    const { rows, total } = await getMockRecoverySheets({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search,
      statusTab,
      originFilter: originFilter ?? "all",
    });

    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    return ok({
      rows,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return fail(
      error instanceof Error
        ? error.message
        : "No se pudieron cargar las hojas de recuperación",
    );
  }
}

export async function getRecoverySheetDetail(
  id: string,
): Promise<ApiResult<RecoverySheetDetail>> {
  try {
    const detail = await getMockRecoverySheetDetail(id);
    if (!detail) {
      return fail("Hoja de recuperación no encontrada");
    }
    return ok(detail);
  } catch (error) {
    return fail(
      error instanceof Error
        ? error.message
        : "No se pudo cargar la hoja de recuperación",
    );
  }
}

export async function updateRecoverySheetStatus(
  id: string,
  status: RecoverySheetStatus,
): Promise<ApiResult<RecoverySheetDetail>> {
  try {
    const updated = await updateMockRecoverySheetStatus(id, status);
    return ok(updated);
  } catch (error) {
    return fail(
      error instanceof Error
        ? error.message
        : "No se pudo actualizar el estatus",
    );
  }
}

export async function receiveRecoveryItem(
  id: string,
  payload: ReceiveRecoveryItemPayload,
): Promise<ApiResult<RecoverySheetDetail>> {
  try {
    const updated = await receiveMockRecoveryItem(id, payload);
    return ok(updated);
  } catch (error) {
    return fail(
      error instanceof Error
        ? error.message
        : "No se pudo registrar la recepción del artículo",
    );
  }
}

export async function searchRecoverySheets(
  query: string,
): Promise<RecoverySheetListItem[]> {
  return searchMockRecoverySheets(query);
}
