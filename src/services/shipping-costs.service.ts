import { get, put, type ApiResult } from "@/lib/axios";
import type {
  MunicipalityShippingCatalogItem,
  MunicipalityShippingConfig,
  SaveMunicipalityShippingConfigResponse,
  UpsertMunicipalityShippingConfigPayload,
} from "@/types/shipping-costs.types";

const BASE = "/shipping-costs";

export async function getConfiguredMunicipalityShippingCatalog(): Promise<
  ApiResult<MunicipalityShippingCatalogItem[]>
> {
  return get<MunicipalityShippingCatalogItem[]>(`${BASE}/municipalities`);
}

export async function getMunicipalityShippingConfig(
  municipalityId: number
): Promise<ApiResult<MunicipalityShippingConfig>> {
  return get<MunicipalityShippingConfig>(
    `${BASE}/municipalities/${municipalityId}`
  );
}

export async function upsertMunicipalityShippingConfig(
  municipalityId: number,
  payload: UpsertMunicipalityShippingConfigPayload
): Promise<ApiResult<SaveMunicipalityShippingConfigResponse>> {
  return put<SaveMunicipalityShippingConfigResponse>(
    `${BASE}/municipalities/${municipalityId}`,
    payload
  );
}
