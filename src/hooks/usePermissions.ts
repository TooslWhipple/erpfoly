import { useAuthStore } from "@/store/useAuthStore";
import { shouldBypassAccessControl } from "@/lib/accessControl";
import {
  canAccessPath,
  hasAccessRequirement,
  isSuperAdmin,
  type AccessRequirement,
} from "@/lib/routeAccess";

/**
 * Available permission code using module.action format.
 */
export type Permission = string;

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export function usePermissions() {
  const { user } = useAuthStore();

  const hasPermission = (permission: Permission): boolean => {
    if (shouldBypassAccessControl) return true;
    if (!user) return false;

    if (isSuperAdmin(user)) return true;

    return user.permissions?.includes(permission) ?? false;
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasRole = (role: string): boolean => {
    if (shouldBypassAccessControl) return true;
    if (!user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (shouldBypassAccessControl) return true;
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canAccess = (requirement?: AccessRequirement): boolean => {
    return hasAccessRequirement(user, requirement);
  };

  const canAccessRoute = (pathname: string): boolean => {
    return canAccessPath(pathname, user);
  };

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    canAccess,
    canAccessRoute,
    isAuthenticated: !!user,
    user,
  };
}

