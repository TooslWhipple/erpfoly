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

const ROLES_BASE = "/authorization/roles";
const ROLE_BASE = "/authorization/role";

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
    const url = query ? `${ROLES_BASE}?${query}` : ROLES_BASE;
    return get<PaginatedResponse<RoleListItem>>(url);
}

export async function getRoleDetail(roleId: number): Promise<RoleDetailResponse> {
    const url = `${ROLE_BASE}/${roleId}?includeAllPermissions=true`;
    return get<RoleDetailResponse>(url);
}

export async function getPermissionsTemplate(): Promise<PermissionsTemplateResponse> {
    return get<PermissionsTemplateResponse>("/authorization/permissions");
}

export interface CreateRolePayload {
    name: string;
    description?: string;
}

export async function createRole(
    payload: CreateRolePayload
): Promise<{ id: number; name: string; description?: string | null }> {
    return post<{ id: number; name: string; description?: string | null }>(
        ROLE_BASE,
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
        `${ROLE_BASE}/${roleId}`,
        payload
    );
}

export async function updateRolePermissions(
    roleId: number,
    payload: UpdateRolePermissionsPayload
): Promise<{ added: number; removed: number }> {
    return patch<{ added: number; removed: number }>(
        `${ROLE_BASE}/${roleId}/permissions`,
        payload
    );
}
