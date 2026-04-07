import { del, get, patch, post } from "@/lib/axios";
import type { ApiResult, ApiSuccessPayload, PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

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

export type GetDepartmentsResponse = PaginatedRowsResponse<Department>;

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
  return get<GetDepartmentsResponse>(buildListUrl(BASE, params));
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

export async function deleteDepartment(
  id: number
): Promise<ApiResult<ApiSuccessPayload>> {
  return del<ApiSuccessPayload>(`${BASE}/${id}`);
}

// ============================================================================
// CATALOG (GET /departments/catalog — Departments.Read)
// ============================================================================

export interface DepartmentCatalogItem {
  id: number;
  name: string;
  code: string | null;
}

export async function getDepartmentsCatalog(): Promise<
  ApiResult<DepartmentCatalogItem[]>
> {
  return get<DepartmentCatalogItem[]>(`${BASE}/catalog`);
}
