import { get, patch, post, unwrapOrThrow } from "@/lib/axios";
import type { PaginatedResponse } from "@/lib/axios";

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
): Promise<GetDepartmentsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));
  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }
  const query = searchParams.toString();
  const url = query ? `${BASE}?${query}` : BASE;
  const result = await get<GetDepartmentsResponse>(url);
  return unwrapOrThrow(result);
}

export async function createDepartment(
  payload: CreateDepartmentPayload
): Promise<Department> {
  const result = await post<Department>(BASE, payload);
  return unwrapOrThrow(result);
}

export async function updateDepartment(
  id: number,
  payload: UpdateDepartmentPayload
): Promise<Department> {
  const result = await patch<Department>(`${BASE}/${id}`, payload);
  return unwrapOrThrow(result);
}

export async function getDepartmentById(id: number): Promise<Department> {
  const result = await get<Department>(`${BASE}/${id}`);
  return unwrapOrThrow(result);
}
