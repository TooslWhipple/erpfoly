/**
 * Role list item as returned by GET /authorization/roles (paginated list).
 */
export interface RoleListItem {
    id: number;
    name: string;
    description?: string | null;
    status: string;
    createdAt: string;
    updatedAt: string | null;
    userCount: number;
    modules: RoleListModule[];
}

export interface RoleListModule {
    id: number;
    name: string;
    description?: string | null;
    permissions: Array<{
        id: number;
        name: string;
        description?: string | null;
        type: string;
    }>;
}

/** Response of GET /authorization/role/:roleId?includeAllPermissions=true */
export interface RoleDetailResponse {
    role: {
        id: number;
        name: string;
        description: string | null;
    };
    modules: Array<{
        screenId: number;
        screenCode: string;
        module: string;
        description: string | null;
        permissions: Array<{
            id: number;
            name: string;
            description: string | null;
            type: string;
            assigned: boolean;
        }>;
    }>;
}

/** Response of GET /authorization/permissions (all modules, no role context) */
export type PermissionsTemplateResponse = RoleDetailResponse["modules"];

/** Payload for PATCH /authorization/role/:roleId/permissions */
export interface UpdateRolePermissionsPayload {
    permissions: Array<{ screenId: number; actionIds: number[] }>;
}
