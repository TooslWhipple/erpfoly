import { get, post, patch, del, unwrapOrThrow, type ApiResult, type ApiSuccessPayload } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

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
  return get<GetBranchesResponse>(buildListUrl(BASE, params));
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
): Promise<ApiResult<ApiSuccessPayload>> {
  return del<ApiSuccessPayload>(`${BASE}/${id}`);
}

export interface BranchCatalogItem {
  id: number;
  name: string;
}

export async function getBranchesCatalog(): Promise<BranchCatalogItem[]> {
  return unwrapOrThrow(await get<BranchCatalogItem[]>(`${BASE}/catalog`));
}
