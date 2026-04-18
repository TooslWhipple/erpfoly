import { get, unwrapOrThrow } from "@/lib/axios";

export interface MaritalStatusCatalogItem {
  id: number;
  code: string;
  name: string;
}

export interface FamilyRelationshipCatalogItem {
  id: number;
  code: string;
  name: string;
}

export async function getMaritalStatuses(): Promise<MaritalStatusCatalogItem[]> {
  const result = await get<MaritalStatusCatalogItem[]>("/catalog/marital-statuses");
  return unwrapOrThrow(result);
}

export async function getFamilyRelationships(): Promise<FamilyRelationshipCatalogItem[]> {
  const result = await get<FamilyRelationshipCatalogItem[]>("/catalog/family-relationships");
  return unwrapOrThrow(result);
}
