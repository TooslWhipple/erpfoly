import { del, get, patch, post } from "@/lib/axios";
import type { ApiResult, PaginatedResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

// ============================================================================
// TYPES
// ============================================================================

export interface RepairSupplierDepartment {
  id: number;
  name: string;
}

export interface RepairSupplier {
  id: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  hoursThisMonth: number;
  departments: RepairSupplierDepartment[];
}

export interface GetRepairSuppliersParams {
  page: number;
  limit: number;
  search?: string;
}

export type GetRepairSuppliersResponse = PaginatedResponse<RepairSupplier>;

export interface CreateRepairSupplierPayload {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  departmentIds?: number[];
}

export interface UpdateRepairSupplierPayload {
  name?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  departmentIds?: number[];
}

export interface DeleteRepairSupplierResponse {
  message: string;
}

// ============================================================================
// API
// ============================================================================

const BASE = "/repair-suppliers";

export async function getRepairSuppliers(
  params: GetRepairSuppliersParams
): Promise<ApiResult<GetRepairSuppliersResponse>> {
  return get<GetRepairSuppliersResponse>(buildListUrl(BASE, params));
}

export async function createRepairSupplier(
  payload: CreateRepairSupplierPayload
): Promise<ApiResult<RepairSupplier>> {
  return post<RepairSupplier>(BASE, payload);
}

export async function updateRepairSupplier(
  id: number,
  payload: UpdateRepairSupplierPayload
): Promise<ApiResult<RepairSupplier>> {
  return patch<RepairSupplier>(`${BASE}/${id}`, payload);
}

export async function getRepairSupplierById(
  id: number
): Promise<ApiResult<RepairSupplier>> {
  return get<RepairSupplier>(`${BASE}/${id}`);
}

export async function deleteRepairSupplier(
  id: number
): Promise<ApiResult<DeleteRepairSupplierResponse>> {
  return del<DeleteRepairSupplierResponse>(`${BASE}/${id}`);
}
