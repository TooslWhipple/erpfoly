import { get, unwrapOrThrow } from "@/lib/axios";

export interface MunicipalityCatalogItem {
  id: number;
  name: string;
  stateName: string;
}

export interface MunicipalityZoneCatalogItem {
  id: number;
  name: string;
}

interface GetMunicipalityCatalogParams {
  search?: string;
  limit?: number;
  has_branches?: boolean;
}

export async function getMunicipalityCatalog(
  params: GetMunicipalityCatalogParams = {}
): Promise<MunicipalityCatalogItem[]> {
  const result = await get<MunicipalityCatalogItem[]>("/municipalities/catalog", {
    params,
  });
  return unwrapOrThrow(result);
}

export async function getMunicipalityZonesCatalog(
  municipalityId: number
): Promise<MunicipalityZoneCatalogItem[]> {
  const result = await get<MunicipalityZoneCatalogItem[]>(
    `/municipalities/${municipalityId}/zones/catalog`
  );
  return unwrapOrThrow(result);
}
