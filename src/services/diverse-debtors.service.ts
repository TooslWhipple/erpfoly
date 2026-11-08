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
  CreateDiverseDebtorPayload,
  DiverseDebtorListItem,
  ListDiverseDebtorsParams,
  UpdateDiverseDebtorPayload,
} from "@/types/diverse-debtors.types";

export type {
  CreateDiverseDebtorPayload,
  DiverseDebtorListItem,
  ListDiverseDebtorsParams,
  UpdateDiverseDebtorPayload,
};

const BASE = "/diverse-debtors";

export type GetDiverseDebtorsResponse =
  PaginatedRowsResponse<DiverseDebtorListItem>;

export async function getDiverseDebtors(
  params: ListDiverseDebtorsParams,
): Promise<ApiResult<GetDiverseDebtorsResponse>> {
  const result = await get<any>(buildListUrl(BASE, params));
  if (result.data) {
    const raw = result.data;
    const rows: DiverseDebtorListItem[] =
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

export async function getDiverseDebtorsCatalog(): Promise<DiverseDebtorListItem[]> {
  const result = await get<DiverseDebtorListItem[]>(`${BASE}/catalog`);
  return result.data ?? [];
}

export async function getDiverseDebtorById(
  id: number | string,
): Promise<ApiResult<DiverseDebtorListItem>> {
  return get<DiverseDebtorListItem>(`${BASE}/${id}`);
}

export async function createDiverseDebtor(
  payload: CreateDiverseDebtorPayload,
): Promise<ApiResult<DiverseDebtorListItem>> {
  return post<DiverseDebtorListItem>(BASE, payload);
}

export async function updateDiverseDebtor(
  id: number | string,
  payload: UpdateDiverseDebtorPayload,
): Promise<ApiResult<DiverseDebtorListItem>> {
  return patch<DiverseDebtorListItem>(`${BASE}/${id}`, payload);
}

export async function deleteDiverseDebtor(
  id: number | string,
): Promise<ApiResult<{ success: boolean }>> {
  return del<{ success: boolean }>(`${BASE}/${id}`);
}

