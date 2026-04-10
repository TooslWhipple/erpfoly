import { get, post, patch, del, type ApiResult, type ApiSuccessPayload } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

// ============================================================================
// TYPES
// ============================================================================

export interface UserListItem {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    cellphone: string;
    roleId: number;
    roleName: string;
    breanches: number[];
    createdAt: string;
    updatedAt: string;
}

export interface UserDetail {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    cellphone: string;
    roleId: number;
    roleName: string;
    branches: BranchItem[];
    branchIds: number[];
}

export interface RoleItem {
    id: number;
    name: string;
}

export interface BranchItem {
    id: number;
    name: string;
}

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface GetUsersResponse {
    rows: UserListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateUserPayload {
    firstName: string;
    lastName: string;
    username: string;
    cellphone?: string;
    email?: string;
    password: string;
    roleId: number;
    branchIds: number[];
}

export interface UpdateUserPayload {
    firstName?: string;
    lastName?: string;
    username?: string;
    cellphone?: string;
    email?: string;
    password?: string;
    roleId?: number;
    branchIds?: number[];
}

// ============================================================================
// API
// ============================================================================

const BASE = "/users";
const CATALOG = "/catalog";

export async function getUsers(
    params: GetUsersParams = {}
): Promise<ApiResult<GetUsersResponse>> {
  return get<GetUsersResponse>(buildListUrl(BASE, params));
}

export async function getUser(id: number): Promise<ApiResult<UserDetail>> {
    return get<UserDetail>(`${BASE}/${id}`);
}

export async function getRoles(): Promise<ApiResult<RoleItem[]>> {
    return get<RoleItem[]>(`${CATALOG}/roles`);
}

export async function getBranches(): Promise<ApiResult<BranchItem[]>> {
    return get<BranchItem[]>(`${CATALOG}/branches`);
}

export async function createUser(
    payload: CreateUserPayload
): Promise<ApiResult<UserListItem & ApiSuccessPayload>> {
    const body = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
        cellphone: payload.cellphone || undefined,
        email: payload.email || undefined,
        password: payload.password,
        roleId: payload.roleId,
        branchIds: payload.branchIds,
    };
    return post<UserListItem & ApiSuccessPayload>(BASE, body);
}

export async function updateUser(
    id: number,
    payload: UpdateUserPayload
): Promise<ApiResult<UserDetail & ApiSuccessPayload>> {
    const body: Record<string, unknown> = {};
    if (payload.firstName !== undefined) body.firstName = payload.firstName;
    if (payload.lastName !== undefined) body.lastName = payload.lastName;
    if (payload.username !== undefined) body.username = payload.username;
    if (payload.cellphone !== undefined) body.cellphone = payload.cellphone;
    if (payload.email !== undefined) body.email = payload.email;
    if (payload.password !== undefined) body.password = payload.password;
    if (payload.roleId !== undefined) body.roleId = payload.roleId;
    if (payload.branchIds !== undefined) body.branchIds = payload.branchIds;
    return patch<UserDetail & ApiSuccessPayload>(`${BASE}/${id}`, body);
}

export async function deleteUser(id: number): Promise<ApiResult<{ id: number; message: string }>> {
    return del<{ id: number; message: string }>(`${BASE}/${id}`);
}
