import { get, post, patch, del } from "@/lib/axios";

// ============================================================================
// TYPES
// ============================================================================

export interface UserListItem {
    id: number;
    name: string;
    email: string;
    roleId: number;
    roleName: string;
}

export interface UserDetail {
    id: number;
    name: string;
    username: string;
    phone: string;
    roleId: number;
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
    data: UserListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateUserPayload {
    firstName: string;
    lastName: string;
    username: string;
    phone?: string;
    email?: string;
    password: string;
    roleId: number;
    branchIds: number[];
}

export interface UpdateUserPayload {
    firstName?: string;
    lastName?: string;
    username?: string;
    phone?: string;
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
): Promise<GetUsersResponse> {
    const searchParams = new URLSearchParams();
    if (params.page != null) searchParams.set("page", String(params.page));
    if (params.limit != null) searchParams.set("limit", String(params.limit));
    if (params.search?.trim()) searchParams.set("search", params.search.trim());
    const query = searchParams.toString();
    const url = query ? `${BASE}?${query}` : BASE;
    return get<GetUsersResponse>(url);
}

export async function getUser(id: number): Promise<UserDetail> {
    return get<UserDetail>(`${BASE}/${id}`);
}

export async function getRoles(): Promise<RoleItem[]> {
    return get<RoleItem[]>(`${CATALOG}/roles`);
}

export async function getBranches(): Promise<BranchItem[]> {
    return get<BranchItem[]>(`${CATALOG}/branches`);
}

export async function createUser(
    payload: CreateUserPayload
): Promise<UserListItem> {
    const body = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
        phone: payload.phone || undefined,
        email: payload.email || undefined,
        password: payload.password,
        roleId: payload.roleId,
        branchIds: payload.branchIds,
    };
    return post<UserListItem>(BASE, body);
}

export async function updateUser(
    id: number,
    payload: UpdateUserPayload
): Promise<UserDetail> {
    const body: Record<string, unknown> = {};
    if (payload.firstName !== undefined) body.firstName = payload.firstName;
    if (payload.lastName !== undefined) body.lastName = payload.lastName;
    if (payload.username !== undefined) body.username = payload.username;
    if (payload.phone !== undefined) body.phone = payload.phone;
    if (payload.email !== undefined) body.email = payload.email;
    if (payload.password !== undefined) body.password = payload.password;
    if (payload.roleId !== undefined) body.roleId = payload.roleId;
    if (payload.branchIds !== undefined) body.branchIds = payload.branchIds;
    return patch<UserDetail>(`${BASE}/${id}`, body);
}

export async function deleteUser(id: number): Promise<{ id: number; message: string }> {
    return del<{ id: number; message: string }>(`${BASE}/${id}`);
}
