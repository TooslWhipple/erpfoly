import { get, post, patch } from "@/lib/axios";
import type { ApiResult, PaginatedResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
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

const ROLES_BASE = "/role";

export async function getRolesList(
  params: GetRolesListParams
): Promise<ApiResult<PaginatedResponse<RoleListItem>>> {
  return get<PaginatedResponse<RoleListItem>>(buildListUrl(ROLES_BASE, params));
}

export async function getRoleDetail(roleId: number): Promise<ApiResult<RoleDetailResponse>> {
  const url = `/role/${roleId}`;
  return get<RoleDetailResponse>(url);
}

export async function getPermissionsTemplate(): Promise<ApiResult<PermissionsTemplateResponse>> {
  return get<PermissionsTemplateResponse>("/role/permissions");
}

export interface CreateRolePayload {
  name: string;
  description?: string;
}

export async function createRole(
  payload: CreateRolePayload
): Promise<ApiResult<{ id: number; name: string; description?: string | null }>> {
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
): Promise<ApiResult<{ id: number; name: string; description?: string | null }>> {
  return patch<{ id: number; name: string; description?: string | null }>(
    `/role/${roleId}`,
    payload
  );
}

export async function updateRolePermissions(
  roleId: number,
  payload: UpdateRolePermissionsPayload
): Promise<ApiResult<{ added: number; removed: number }>> {
  return patch<{ added: number; removed: number }>(
    `/role/${roleId}/permissions`,
    payload
  );
}
