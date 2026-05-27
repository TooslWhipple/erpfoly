import { get, unwrapOrThrow } from "@/lib/axios";

export interface MunicipalityCatalogItem {
  id: number;
  name: string;
  stateName: string;
}

interface GetMunicipalityCatalogParams {
  search?: string;
  limit?: number;
}

export async function getMunicipalityCatalog(
  params: GetMunicipalityCatalogParams = {}
): Promise<MunicipalityCatalogItem[]> {
  const result = await get<MunicipalityCatalogItem[]>("/municipalities/catalog", {
    params,
  });
  return unwrapOrThrow(result);
}
