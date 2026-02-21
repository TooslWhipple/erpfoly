import { get, unwrapOrThrow } from "@/lib/axios";
import type { PaginatedResponse } from "@/lib/axios";

// ============================================================================
// TYPES
// ============================================================================

export interface ProductLineItem {
  id: number;
  name: string;
  code: string | null;
}

export interface GetProductLinesParams {
  departmentId: number;
  page?: number;
  limit?: number;
  search?: string;
}

export type GetProductLinesResponse = PaginatedResponse<ProductLineItem>;

// ============================================================================
// API
// ============================================================================

const BASE = "/product-lines";

export async function getProductLines(
  params: GetProductLinesParams
): Promise<GetProductLinesResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("departmentId", String(params.departmentId));
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }
  const query = searchParams.toString();
  const url = `${BASE}?${query}`;
  const result = await get<GetProductLinesResponse>(url);
  return unwrapOrThrow(result);
}
