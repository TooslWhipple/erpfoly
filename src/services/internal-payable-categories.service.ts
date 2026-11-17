import {
  del,
  get,
  patch,
  post,
  type ApiResult,
  type PaginatedRowsResponse,
} from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  CreateInternalPayableCategoryPayload,
  InternalPayableCategoryListItem,
  ListInternalPayableCategoriesParams,
  UpdateInternalPayableCategoryPayload,
} from "@/types/internal-payable-categories.types";

const BASE = "/internal-payable-categories";

export type GetInternalPayableCategoriesResponse =
  PaginatedRowsResponse<InternalPayableCategoryListItem>;

export async function getInternalPayableCategories(
  params: ListInternalPayableCategoriesParams,
): Promise<ApiResult<GetInternalPayableCategoriesResponse>> {
  const result = await get<any>(buildListUrl(BASE, params));
  if (result.data) {
    const raw = result.data;
    const rows: InternalPayableCategoryListItem[] =
      raw.rows ??
      raw.data ??
      (Array.isArray(raw) ? raw : []);
    const total = raw.total ?? rows.length;
    const limit = raw.limit ?? params.limit ?? 10;
    const page = raw.page ?? params.page ?? 1;
    const totalPages = raw.totalPages ?? Math.max(1, Math.ceil(total / limit));

    return {
      ...result,
      data: {
        rows,
        total,
        totalPages,
        page,
        limit,
      },
    };
  }
  return result;
}

export async function createInternalPayableCategory(
  payload: CreateInternalPayableCategoryPayload,
): Promise<ApiResult<InternalPayableCategoryListItem>> {
  return post<InternalPayableCategoryListItem>(BASE, payload);
}

export async function updateInternalPayableCategory(
  id: string | number,
  payload: UpdateInternalPayableCategoryPayload,
): Promise<ApiResult<InternalPayableCategoryListItem>> {
  return patch<InternalPayableCategoryListItem>(`${BASE}/${id}`, payload);
}

export async function deleteInternalPayableCategory(
  id: string | number,
): Promise<ApiResult<{ success: boolean }>> {
  return del<{ success: boolean }>(`${BASE}/${id}`);
}

