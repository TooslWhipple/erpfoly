import { get, post, patch, del, type ApiResult } from "@/lib/axios";

// ============================================================================
// TYPES
// ============================================================================

export interface Branch {
  id: number;
  name: string;
  status?: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface GetBranchesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetBranchesResponse {
  rows: Branch[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface CreateBranchPayload {
  name: string;
}

export interface UpdateBranchPayload {
  name?: string;
  status?: "ACTIVE" | "INACTIVE";
}

// ============================================================================
// API
// ============================================================================

const BASE = "/branches";

export async function getBranches(
  params: GetBranchesParams = {}
): Promise<ApiResult<GetBranchesResponse>> {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.search?.trim()) searchParams.set("search", params.search.trim());
  const query = searchParams.toString();
  const url = query ? `${BASE}?${query}` : BASE;
  return get<GetBranchesResponse>(url);
}

export async function getBranch(id: number): Promise<ApiResult<Branch>> {
  return get<Branch>(`${BASE}/${id}`);
}

export async function createBranch(
  payload: CreateBranchPayload
): Promise<ApiResult<Branch>> {
  return post<Branch>(BASE, payload);
}

export async function updateBranch(
  id: number,
  payload: UpdateBranchPayload
): Promise<ApiResult<Branch>> {
  return patch<Branch>(`${BASE}/${id}`, payload);
}

export async function deleteBranch(
  id: number
): Promise<ApiResult<{ success?: boolean; message?: string }>> {
  return del<{ success?: boolean; message?: string }>(`${BASE}/${id}`);
}
