import { get, patch } from "@/lib/axios";
import type { ApiResult } from "@/lib/axios";
import type {
  MoratoryRateConfigResponse,
  UpdateMoratoryRateConfigPayload,
} from "@/types/moratoryRate.types";

const BASE = "/moratory-rate-config";

export async function getMoratoryRateConfig(): Promise<
  ApiResult<MoratoryRateConfigResponse>
> {
  return get<MoratoryRateConfigResponse>(BASE);
}

export async function updateMoratoryRateConfig(
  payload: UpdateMoratoryRateConfigPayload
): Promise<ApiResult<MoratoryRateConfigResponse>> {
  return patch<MoratoryRateConfigResponse>(BASE, payload);
}
