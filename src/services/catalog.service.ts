import { get, unwrapOrThrow } from "@/lib/axios";

export interface MaritalStatusCatalogItem {
  id: number;
  code: string;
  name: string;
}

export async function getMaritalStatuses(): Promise<MaritalStatusCatalogItem[]> {
  const result = await get<MaritalStatusCatalogItem[]>("/catalog/marital-statuses");
  return unwrapOrThrow(result);
}
