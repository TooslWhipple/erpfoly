import { get, unwrapOrThrow } from "@/lib/axios";

export interface NeighborhoodPostalLookupItem {
  full_code: string;
  name: string;
  locality_name: string;
  municipality_name: string;
  state_name: string;
}

export async function getNeighborhoodsByPostalCode(
  postalCode: string
): Promise<NeighborhoodPostalLookupItem[]> {
  const result = await get<NeighborhoodPostalLookupItem[]>("/addresses/neighborhoods", {
    params: { postalCode },
  });
  return unwrapOrThrow(result);
}

export interface HousingTypeCatalogItem {
  id: number;
  code: string;
  name: string;
}

export async function getHousingTypes(): Promise<HousingTypeCatalogItem[]> {
  const result = await get<HousingTypeCatalogItem[]>("/addresses/housing-types");
  return unwrapOrThrow(result);
}
