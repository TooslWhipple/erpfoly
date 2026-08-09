import {
  get,
  post,
  patch,
  type ApiResult,
  type PaginatedRowsResponse,
} from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  CreateZonePayload,
  GetZonesParams,
  UpdateZonePayload,
  ZoneCatalogItem,
  ZoneListItem,
} from "@/types/zones.types";

const BASE = "/zones";

export type GetZonesResponse = PaginatedRowsResponse<ZoneListItem>;

export async function getZones(
  params: GetZonesParams,
): Promise<ApiResult<GetZonesResponse>> {
  return get<GetZonesResponse>(buildListUrl(BASE, params));
}

export async function createZone(
  payload: CreateZonePayload,
): Promise<ApiResult<ZoneListItem>> {
  return post<ZoneListItem>(BASE, payload);
}

export async function updateZone(
  id: number,
  payload: UpdateZonePayload,
): Promise<ApiResult<ZoneListItem>> {
  return patch<ZoneListItem>(`${BASE}/${id}`, payload);
}

export async function getZonesCatalog(): Promise<ZoneCatalogItem[]> {
  const result = await get<ZoneCatalogItem[]>(`${BASE}/catalog`);
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data ?? [];
}
