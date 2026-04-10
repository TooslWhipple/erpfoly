import { get, put } from "@/lib/axios";
import type { ApiResult } from "@/lib/axios";
import type {
  PurchaseType,
  PointsConfigResponse,
  SavePointsConfigPayload,
  SavePointsConfigResponse,
} from "@/types/folypuntos.types";

const BASE = "points";

export async function getPurchaseTypes(): Promise<
  ApiResult<PurchaseType[]>
> {
  return get<PurchaseType[]>(`${BASE}/purchase-types`);
}

export async function getPointsConfig(): Promise<
  ApiResult<PointsConfigResponse>
> {
  return get<PointsConfigResponse>(`${BASE}/config`);
}

export async function savePointsConfig(
  payload: SavePointsConfigPayload
): Promise<ApiResult<SavePointsConfigResponse>> {
  return put<SavePointsConfigResponse>(`${BASE}/config`, payload);
}
