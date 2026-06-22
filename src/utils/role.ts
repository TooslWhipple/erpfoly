import type { ModulePermission, Permission } from "@/components/PermissionsTable";
import type { PermissionsTemplateResponse } from "@/types/roles.types";

const PERMISSION_KEYS: Array<keyof Permission> = [
  "view",
  "create",
  "edit",
  "delete",
];

/**
 * Converts API modules (permissions template or role detail) to table shape.
 */
export function apiModulesToTableModules(
  modules: PermissionsTemplateResponse,
): ModulePermission[] {
  return modules.map((m) => {
    const byCode = Object.fromEntries(
      m.permissions.map((p) => [p.name, p.assigned]),
    ) as Record<string, boolean>;
    return {
      id: m.screenCode,
      name: m.module,
      permissions: {
        view: byCode["view"] ?? false,
        create: byCode["create"] ?? false,
        edit: byCode["edit"] ?? false,
        delete: byCode["delete"] ?? false,
      },
    };
  });
}

/**
 * Builds the payload for PATCH role permissions from API modules and current table state.
 */
export function tableModulesToPayload(
  modules: PermissionsTemplateResponse,
  tableModules: ModulePermission[],
): Array<{ screenId: number; actionIds: number[] }> {
  const actionIdByCode = new Map<string, number>();
  for (const apiMod of modules) {
    for (const permission of apiMod.permissions) {
      const key = permission.name as keyof Permission;
      if (PERMISSION_KEYS.includes(key)) {
        actionIdByCode.set(key, permission.id);
      }
    }
  }

  return modules.map((apiMod) => {
    const tableMod = tableModules.find((t) => t.id === apiMod.screenCode);
    const actionIds = tableMod
      ? PERMISSION_KEYS.filter((key) => tableMod.permissions[key])
          .map((key) => actionIdByCode.get(key))
          .filter((id): id is number => id != null)
      : [];
    return { screenId: apiMod.screenId, actionIds };
  });
}

/**
 * Deep equality for two ModulePermission arrays (by id and permissions).
 */
export function areModulesEqual(
  a: ModulePermission[],
  b: ModulePermission[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((modA, i) => {
    const modB = b[i];
    if (!modB || modA.id !== modB.id) return false;
    const pA = modA.permissions;
    const pB = modB.permissions;
    return (
      pA.view === pB.view &&
      pA.create === pB.create &&
      pA.edit === pB.edit &&
      pA.delete === pB.delete
    );
  });
}
