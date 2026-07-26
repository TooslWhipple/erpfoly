import { get, post, patch, del, unwrapOrThrow, type ApiResult, type ApiSuccessPayload, type PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

// ============================================================================
// TYPES
// ============================================================================

export interface BranchAddress {
  postalCode?: string | null;
  neighborhoodFullCode?: string | null;
  neighborhoodName?: string | null;
  state?: string | null;
  municipality?: string | null;
  street?: string | null;
  externalNumber?: string | null;
  internalNumber?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface BusinessSegmentItem {
  id: number;
  nombre: string;
  codigo: string;
  numero: number;
}

export interface Branch {
  id: number;
  name: string;
  status?: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
  postalCode?: string | null;
  neighborhoodFullCode?: string | null;
  neighborhoodName?: string | null;
  state?: string | null;
  municipality?: string | null;
  street?: string | null;
  externalNumber?: string | null;
  internalNumber?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geocodedAt?: string | null;
  businessSegmentId?: number | null;
  businessSegment?: BusinessSegmentItem | null;
}

export interface GetBranchesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export type GetBranchesResponse = PaginatedRowsResponse<Branch>;

export interface CreateBranchPayload {
  name: string;
  postalCode?: string;
  neighborhoodFullCode?: string;
  neighborhoodName?: string;
  state?: string;
  municipality?: string;
  street?: string;
  externalNumber?: string;
  internalNumber?: string;
  latitude?: number;
  longitude?: number;
  businessSegmentId?: number | null;
}

export interface UpdateBranchPayload {
  name?: string;
  status?: "ACTIVE" | "INACTIVE";
  postalCode?: string;
  neighborhoodFullCode?: string;
  neighborhoodName?: string;
  state?: string;
  municipality?: string;
  street?: string;
  externalNumber?: string;
  internalNumber?: string;
  latitude?: number;
  longitude?: number;
  businessSegmentId?: number | null;
}

export interface GeocodeBranchPayload {
  street: string;
  externalNumber?: string;
  internalNumber?: string;
  neighborhoodName?: string;
  municipality?: string;
  state?: string;
  postalCode?: string;
}

export interface GeocodeBranchResult {
  lat: number;
  lng: number;
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

export async function getAvailableBusinessSegments(
  currentBranchId?: number,
  search?: string,
): Promise<BusinessSegmentItem[]> {
  const params: Record<string, string> = {};
  if (currentBranchId) params.currentBranchId = String(currentBranchId);
  if (search?.trim()) params.search = search.trim();
  return unwrapOrThrow(
    await get<BusinessSegmentItem[]>(`${BASE}/business-segments`, { params }),
  );
}

export interface BranchCatalogItem {
  id: number;
  name: string;
  is_main_warehouse: boolean;
  municipality?: string | null;
}

export async function getBranchesCatalog(
  search?: string,
): Promise<BranchCatalogItem[]> {
  const trimmed = search?.trim();
  return unwrapOrThrow(
    await get<BranchCatalogItem[]>(`${BASE}/catalog`, {
      params: trimmed ? { search: trimmed } : undefined,
    }),
  );
}

export async function getMainWarehouse(): Promise<BranchCatalogItem | null> {
  const result = await getBranchesCatalog();
  return result.find((b) => b.is_main_warehouse) ?? null;
}

export async function geocodeBranchAddress(
  payload: GeocodeBranchPayload
): Promise<ApiResult<GeocodeBranchResult | null>> {
  return post<GeocodeBranchResult | null>(`${BASE}/geocode`, payload);
}
