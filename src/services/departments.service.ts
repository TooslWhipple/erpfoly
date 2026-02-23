import { del, get, patch, post } from "@/lib/axios";
import type { ApiResult, PaginatedResponse } from "@/lib/axios";

// ============================================================================
// TYPES
// ============================================================================

export interface ProductGroup {
  id: string;
  name: string;
}

export interface Department {
  id: number;
  name: string;
  margin: number;
  groups: ProductGroup[];
  promotion?: {
    percentage: number;
    startDate: string;
    endDate: string;
  };
}

export interface GetDepartmentsParams {
  page: number;
  limit: number;
  search?: string;
}

export type GetDepartmentsResponse = PaginatedResponse<Department>;

export interface CreateDepartmentPayload {
  name: string;
  margin?: number;
  code?: string;
}

export interface UpdateDepartmentPayload {
  name?: string;
  margin?: number;
  code?: string;
}

// ============================================================================
// API
// ============================================================================

const BASE = "/departments";

export async function getDepartments(
  params: GetDepartmentsParams
): Promise<ApiResult<GetDepartmentsResponse>> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));
  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }
  const query = searchParams.toString();
  const url = query ? `${BASE}?${query}` : BASE;
  return get<GetDepartmentsResponse>(url);
}

export async function createDepartment(
  payload: CreateDepartmentPayload
): Promise<ApiResult<Department>> {
  return post<Department>(BASE, payload);
}

export async function updateDepartment(
  id: number,
  payload: UpdateDepartmentPayload
): Promise<ApiResult<Department>> {
  return patch<Department>(`${BASE}/${id}`, payload);
}

export async function getDepartmentById(id: number): Promise<ApiResult<Department>> {
  return get<Department>(`${BASE}/${id}`);
}

export interface DeleteDepartmentResponse {
  message: string;
}

export async function deleteDepartment(
  id: number
): Promise<ApiResult<DeleteDepartmentResponse>> {
  return del<DeleteDepartmentResponse>(`${BASE}/${id}`);
}
