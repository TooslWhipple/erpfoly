import { get, post, patch } from "@/lib/axios";
import type { PaginatedResponse } from "@/lib/axios";
import type {
  RoleListItem,
  RoleDetailResponse,
  PermissionsTemplateResponse,
  UpdateRolePermissionsPayload,
} from "@/types/roles.types";

export interface GetRolesListParams {
  page: number;
  limit: number;
  search?: string;
}

export async function getRolesList(
  params: GetRolesListParams
): Promise<PaginatedResponse<RoleListItem>> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));
  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }
  const query = searchParams.toString();
  const url = query ? `/role?${query}` : '/role';
  return get<PaginatedResponse<RoleListItem>>(url);
}

export async function getRoleDetail(roleId: number): Promise<RoleDetailResponse> {
  const url = `/role/${roleId}`;
  return get<RoleDetailResponse>(url);
}

export async function getPermissionsTemplate(): Promise<PermissionsTemplateResponse> {
  return get<PermissionsTemplateResponse>("/role/permissions");
}

export interface CreateRolePayload {
  name: string;
  description?: string;
}

export async function createRole(
  payload: CreateRolePayload
): Promise<{ id: number; name: string; description?: string | null }> {
  return post<{ id: number; name: string; description?: string | null }>(
    '/role',
    payload
  );
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
}

export async function updateRole(
  roleId: number,
  payload: UpdateRolePayload
): Promise<{ id: number; name: string; description?: string | null }> {
  return patch<{ id: number; name: string; description?: string | null }>(
    `/role/${roleId}`,
    payload
  );
}

export async function updateRolePermissions(
  roleId: number,
  payload: UpdateRolePermissionsPayload
): Promise<{ added: number; removed: number }> {
  return patch<{ added: number; removed: number }>(
    `/role/${roleId}/permissions`,
    payload
  );
}
