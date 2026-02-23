import { del, get, patch, post } from "@/lib/axios";
import type { ApiResult, PaginatedResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

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

export interface CreateProductLinePayload {
  departmentId: number;
  name: string;
  code: string;
}

export interface UpdateProductLinePayload {
  name?: string;
  code?: string;
}

export interface DeleteProductLineResponse {
  message: string;
}

// ============================================================================
// API
// ============================================================================

const BASE = "/product-lines";

export async function getProductLines(
  params: GetProductLinesParams
): Promise<ApiResult<GetProductLinesResponse>> {
  return get<GetProductLinesResponse>(buildListUrl(BASE, params));
}

export async function createProductLine(
  payload: CreateProductLinePayload
): Promise<ApiResult<ProductLineItem>> {
  return post<ProductLineItem>(BASE, payload);
}

export async function updateProductLine(
  id: number,
  payload: UpdateProductLinePayload
): Promise<ApiResult<ProductLineItem>> {
  return patch<ProductLineItem>(`${BASE}/${id}`, payload);
}

export async function deleteProductLine(
  id: number
): Promise<ApiResult<DeleteProductLineResponse>> {
  return del<DeleteProductLineResponse>(`${BASE}/${id}`);
}
