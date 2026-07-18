import { get } from "@/lib/axios";
import type { ApiResult, PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

export type DriverStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "ON_ROUTE"
  | "INACTIVE";

export interface DriverUser {
  id: number;
  first_name: string;
  last_name: string;
}

export interface DriverListItem {
  id: number;
  user_id: number;
  status: DriverStatus;
  phone?: string | null;
  user: DriverUser;
}

export interface GetDriversParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: DriverStatus;
}

/** Drivers list payload (API uses `items`; normalize to rows for selects). */
export interface GetDriversResponse {
  items?: DriverListItem[];
  rows?: DriverListItem[];
  total: number;
  page: number;
  limit: number;
}

const BASE = "/drivers";

export function getDriverDisplayName(driver: DriverListItem): string {
  const first = driver.user?.first_name?.trim() ?? "";
  const last = driver.user?.last_name?.trim() ?? "";
  const full = `${first} ${last}`.trim();
  return full || `Chofer #${driver.user_id}`;
}

export async function getDrivers(
  params: GetDriversParams = {},
): Promise<ApiResult<PaginatedRowsResponse<DriverListItem>>> {
  const result = await get<GetDriversResponse>(
    buildListUrl(BASE, {
      page: params.page ?? 1,
      limit: params.limit ?? 100,
      search: params.search,
      status: params.status,
    }),
  );

  if (result.error != null || result.data == null) {
    return { data: null, error: result.error };
  }

  const rows = result.data.rows ?? result.data.items ?? [];
  return {
    data: {
      rows,
      total: result.data.total ?? rows.length,
      page: result.data.page ?? 1,
      limit: result.data.limit ?? rows.length,
      totalPages: Math.max(
        1,
        Math.ceil((result.data.total ?? rows.length) / (result.data.limit || 1)),
      ),
    },
    error: null,
  };
}
