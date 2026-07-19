import { get, post, patch, del, type ApiResult, type ApiSuccessPayload } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

// ============================================================================
// TYPES
// ============================================================================

export interface UserListItem {
    id: number;
    fullName?: string;
    firstName: string;
    lastName: string;
    username: string;
    cellphone: string;
    roleId: number;
    roleName: string;
    rolePlatform?: 'ERP' | 'APP' | 'INTERNAL';
    status?: string;
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
    roleCode?: string;
    roleName?: string;
    branches?: BranchItem[];
    branchIds: number[];
    requiresOtp: boolean;
    driverDetails?: UserDriverDetails;
}

export interface UserAddressDetails {
    postalCode: string | null;
    neighborhoodFullCode: string;
    street: string;
    externalNumber: string | null;
    internalNumber: string | null;
}

export interface UserDriverDetails {
    licenseNumber: string | null;
    address?: UserAddressDetails;
}

export interface RoleItem {
    id: number;
    name: string;
    code: string;
    platform: 'ERP' | 'APP' | 'INTERNAL';
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

export interface UserDriverDetailsPayload {
    licenseNumber: string;
    address?: {
        postalCode: string;
        neighborhoodFullCode: string;
        street: string;
        externalNumber: string;
        internalNumber?: string;
    };
}

export interface CreateUserPayload {
    firstName: string;
    lastName: string;
    username: string;
    cellphone?: string;
    email?: string;
    roleId: number;
    branchIds: number[];
    requiresOtp?: boolean;
    driverDetails?: UserDriverDetailsPayload;
}

export interface UpdateUserPayload {
    firstName?: string;
    lastName?: string;
    username?: string;
    cellphone?: string;
    email?: string;
    roleId?: number;
    branchIds?: number[];
    requiresOtp?: boolean;
    driverDetails?: UserDriverDetailsPayload;
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
): Promise<ApiResult<ApiSuccessPayload>> {
    const body = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
        cellphone: payload.cellphone || undefined,
        email: payload.email || undefined,
        roleId: payload.roleId,
        branchIds: payload.branchIds,
        ...(payload.requiresOtp !== undefined ? { requiresOtp: payload.requiresOtp } : {}),
        ...(payload.driverDetails ? { driverDetails: payload.driverDetails } : {}),
    };
    return post<ApiSuccessPayload>(BASE, body);
}

export async function updateUser(
    id: number,
    payload: UpdateUserPayload
): Promise<ApiResult<ApiSuccessPayload>> {
    const body: Record<string, unknown> = {};
    if (payload.firstName !== undefined) body.firstName = payload.firstName;
    if (payload.lastName !== undefined) body.lastName = payload.lastName;
    if (payload.username !== undefined) body.username = payload.username;
    if (payload.cellphone !== undefined) body.cellphone = payload.cellphone;
    if (payload.email !== undefined) body.email = payload.email;
    if (payload.roleId !== undefined) body.roleId = payload.roleId;
    if (payload.branchIds !== undefined) body.branchIds = payload.branchIds;
    if (payload.requiresOtp !== undefined) body.requiresOtp = payload.requiresOtp;
    if (payload.driverDetails !== undefined) body.driverDetails = payload.driverDetails;
    return patch<ApiSuccessPayload>(`${BASE}/${id}`, body);
}

export async function deleteUser(id: number): Promise<ApiResult<{ id: number; message: string }>> {
    return del<{ id: number; message: string }>(`${BASE}/${id}`);
}

export async function resetUserAccess(id: number): Promise<ApiResult<ApiSuccessPayload>> {
    return post<ApiSuccessPayload>(`${BASE}/${id}/reset-access`);
}

export async function checkUsernameAvailability(
    username: string,
    excludeUserId?: number,
): Promise<ApiResult<{ exists: boolean }>> {
    const params = new URLSearchParams({ username });
    if (excludeUserId != null) {
        params.set("excludeUserId", String(excludeUserId));
    }
    return get<{ exists: boolean }>(`${BASE}/check-username?${params.toString()}`);
}

export async function updateUserStatus(
    id: number,
    status: "ACTIVE" | "INACTIVE"
): Promise<ApiResult<ApiSuccessPayload>> {
    return patch<ApiSuccessPayload>(`${BASE}/${id}/status`, { status });
}
