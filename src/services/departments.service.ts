import { del, get, patch, post, unwrapOrThrow } from "@/lib/axios";
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
  margin: number;
}

export async function getDepartmentsCatalog(): Promise<DepartmentCatalogItem[]> {
  return unwrapOrThrow(await get<DepartmentCatalogItem[]>(`${BASE}/catalog`));
}

export interface DepartmentLineItem {
  id: number;
  name: string;
  code: string | null;
}

export async function getDepartmentLines(departmentId: number): Promise<DepartmentLineItem[]> {
  return unwrapOrThrow(await get<DepartmentLineItem[]>(`${BASE}/${departmentId}/lines`));
}
