import { useAuthStore } from "@/store/useAuthStore";

/**
 * Permisos disponibles en el sistema
 * Estructura: modulo.accion
 * Ejemplos:
 * - clientes.ver
 * - clientes.crear
 * - clientes.editar
 * - clientes.eliminar
 * - reportes.generar
 * - catalogos.productos.ver
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
    if (!user) return false;

    if (user.role === "admin") return true;

    return user.permissions?.includes(permission) ?? false;
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
    user,
  };
}

