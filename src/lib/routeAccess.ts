import type { User } from "@/store/useAuthStore";
import { shouldBypassAccessControl } from "@/lib/accessControl";
import { ROLE_CODES } from "@/constants/role-codes";
import {
  CASH_REGISTERS_READ,
  CATALOG_BRANCHES_CREATE,
  CATALOG_BRANCHES_READ,
  CATALOG_CASH_REGISTERS_READ,
  CATALOG_DEPARTMENTS_CREATE,
  CATALOG_DEPARTMENTS_READ,
  CATALOG_DEPARTMENTS_UPDATE,
  CATALOG_GOALS_READ,
  CATALOG_MESSAGES_READ,
  CATALOG_MORATORY_RATE_READ,
  CATALOG_POINTS_READ,
  CATALOG_PRODUCTS_CREATE,
  CATALOG_PRODUCTS_READ,
  CATALOG_PRODUCTS_UPDATE,
  CATALOG_PROMOTIONS_CREATE,
  CATALOG_PROMOTIONS_READ,
  CATALOG_PROMOTIONS_UPDATE,
  CATALOG_REPAIR_SUPPLIERS_READ,
  CATALOG_ROLES_CREATE,
  CATALOG_ROLES_READ,
  CATALOG_ROLES_UPDATE,
  CATALOG_SELLERS_READ,
  CATALOG_SHIPPING_COSTS_READ,
  CATALOG_SUPPLIERS_CREATE,
  CATALOG_SUPPLIERS_READ,
  CATALOG_SUPPLIERS_UPDATE,
  CATALOG_USERS_CREATE,
  CATALOG_USERS_READ,
  CATALOG_USERS_UPDATE,
  CREDIT_APPLICATIONS_READ,
  CREDIT_APPLICATIONS_UPDATE,
  CUSTOMER_COLLECTION_READ,
  CUSTOMER_DELINQUENCY_READ,
  CUSTOMER_SUPPORT_READ,
  CUSTOMERS_CREATE,
  CUSTOMERS_READ,
  CUSTOMERS_UPDATE,
  DAMAGED_INVENTORY_READ,
  DISCOUNT_REQUESTS_CREATE,
  DISCOUNT_REQUESTS_READ,
  INVENTORY_LIQUIDATIONS_READ,
  INVENTORY_READ,
  MERCHANDISE_RECEPTION_CREATE,
  MERCHANDISE_RECEPTION_READ,
  COSTEOS_READ,
  PAYABLE_INVOICES_READ,
  INVOICE_REQUESTS_READ,
  GENERAL_EXPENSES_READ,
  SUPPLIER_PAYABLES_READ,
  ORDERS_CREATE,
  ORDERS_READ,
  TRASPASOS_CREATE,
  TRASPASOS_READ,
  TRASPASOS_UPDATE,
  ROUTES_READ,
  SALES_READ,
  SALES_CREATE,
  QUOTATIONS_READ,
  type PermissionCode,
} from "@/lib/permissions";

export const PUBLIC_ROUTES = [
	"/login",
	"/login/validate-otp",
	"/login/change-password",
	"/login/recover",
	"/login/recover/sent",
] as const;
export const CHANGE_PASSWORD_ROUTE = "/login/change-password";
export const FORBIDDEN_ROUTE = "/403";
export const DEFAULT_AUTHENTICATED_ROUTE = "/solicitudes-credito";

export interface AccessRequirement {
  permission?: PermissionCode | string;
  anyPermissions?: Array<PermissionCode | string>;
  allPermissions?: Array<PermissionCode | string>;
  roles?: string[];
  allowAuthenticated?: boolean;
}

export interface RouteAccessRule extends AccessRequirement {
  pattern: RegExp;
  fallbackPath?: string;
}

const AUTHENTICATED_ONLY: AccessRequirement = { allowAuthenticated: true };

export const routeAccessRules: RouteAccessRule[] = [
  { pattern: /^\/$/, ...AUTHENTICATED_ONLY },
  { pattern: /^\/403$/, ...AUTHENTICATED_ONLY },

  { pattern: /^\/solicitudes-credito\/[^/]+\/revision$/, permission: CREDIT_APPLICATIONS_UPDATE },
  { pattern: /^\/solicitudes-credito(\/.*)?$/, permission: CREDIT_APPLICATIONS_READ },

  { pattern: /^\/ventas\/nueva$/, permission: SALES_CREATE },
  { pattern: /^\/ventas\/en-rojo$/, roles: [ROLE_CODES.ADMINISTRADOR] },
  { pattern: /^\/ventas(\/.*)?$/, permission: SALES_READ },
  { pattern: /^\/cotizaciones-guardadas(\/.*)?$/, permission: QUOTATIONS_READ },
  { pattern: /^\/cotizaciones(\/.*)?$/, permission: QUOTATIONS_READ },

  { pattern: /^\/cajas(\/.*)?$/, permission: CASH_REGISTERS_READ },

  { pattern: /^\/clientes\/cobranza(\/.*)?$/, permission: CUSTOMER_COLLECTION_READ },
  { pattern: /^\/clientes\/morosidad(\/.*)?$/, permission: CUSTOMER_DELINQUENCY_READ },
  { pattern: /^\/clientes\/nuevo$/, permission: CUSTOMERS_CREATE },
  { pattern: /^\/clientes\/[^/]+\/editar$/, permission: CUSTOMERS_UPDATE },
  { pattern: /^\/clientes(\/.*)?$/, permission: CUSTOMERS_READ },

  { pattern: /^\/traspasos\/nuevo\/confirmar$/, permission: TRASPASOS_UPDATE },
  { pattern: /^\/traspasos\/nuevo$/, permission: TRASPASOS_CREATE },
  { pattern: /^\/traspasos\/[^/]+\/editar$/, permission: TRASPASOS_UPDATE },
  { pattern: /^\/traspasos(\/.*)?$/, permission: TRASPASOS_READ },
  { pattern: /^\/pedidos\/nuevo$/, permission: ORDERS_CREATE },
  { pattern: /^\/pedidos(\/.*)?$/, permission: ORDERS_READ },

  { pattern: /^\/solicitudes-descuento\/nuevo$/, permission: DISCOUNT_REQUESTS_CREATE },
  { pattern: /^\/solicitudes-descuento\/[^/]+$/, permission: DISCOUNT_REQUESTS_READ },
  { pattern: /^\/solicitudes-descuento$/, permission: DISCOUNT_REQUESTS_READ },

  { pattern: /^\/inventario\/mercancia-danada(\/.*)?$/, permission: DAMAGED_INVENTORY_READ },
  { pattern: /^\/inventario\/liquidaciones(\/.*)?$/, permission: INVENTORY_LIQUIDATIONS_READ },
  { pattern: /^\/inventario(\/.*)?$/, permission: INVENTORY_READ },

  { pattern: /^\/recepcion-mercancias\/nuevo$/, permission: MERCHANDISE_RECEPTION_CREATE },
  { pattern: /^\/recepcion-mercancias(\/.*)?$/, permission: MERCHANDISE_RECEPTION_READ },

  { pattern: /^\/costeos(\/.*)?$/, permission: COSTEOS_READ },

  { pattern: /^\/facturas\/solicitudes(\/.*)?$/, permission: INVOICE_REQUESTS_READ },
  { pattern: /^\/facturas\/gastos-generales(\/.*)?$/, permission: GENERAL_EXPENSES_READ },
  { pattern: /^\/facturas\/proveedores(\/.*)?$/, permission: SUPPLIER_PAYABLES_READ },
  { pattern: /^\/facturas(\/.*)?$/, permission: PAYABLE_INVOICES_READ },

  { pattern: /^\/atencion-cliente(\/.*)?$/, permission: CUSTOMER_SUPPORT_READ },
  { pattern: /^\/rutas(\/.*)?$/, permission: ROUTES_READ },

  { pattern: /^\/catalogos\/productos\/nuevo$/, permission: CATALOG_PRODUCTS_CREATE },
  { pattern: /^\/catalogos\/productos\/[^/]+$/, permission: CATALOG_PRODUCTS_UPDATE },
  { pattern: /^\/catalogos\/productos(\/.*)?$/, permission: CATALOG_PRODUCTS_READ },
  { pattern: /^\/catalogos\/departamentos\/nuevo$/, permission: CATALOG_DEPARTMENTS_CREATE },
  { pattern: /^\/catalogos\/departamentos\/[^/]+$/, anyPermissions: [CATALOG_DEPARTMENTS_READ, CATALOG_DEPARTMENTS_UPDATE] },
  { pattern: /^\/catalogos\/departamentos(\/.*)?$/, permission: CATALOG_DEPARTMENTS_READ },
  { pattern: /^\/catalogos\/promociones\/nuevo$/, permission: CATALOG_PROMOTIONS_CREATE },
  { pattern: /^\/catalogos\/promociones\/[^/]+$/, permission: CATALOG_PROMOTIONS_UPDATE },
  { pattern: /^\/catalogos\/promociones(\/.*)?$/, permission: CATALOG_PROMOTIONS_READ },
  { pattern: /^\/catalogos\/sucursales\/nuevo$/, permission: CATALOG_BRANCHES_CREATE },
  { pattern: /^\/catalogos\/sucursales\/[^/]+$/, permission: CATALOG_BRANCHES_READ },
  { pattern: /^\/catalogos\/sucursales(\/.*)?$/, permission: CATALOG_BRANCHES_READ },
  { pattern: /^\/catalogos\/cajas(\/.*)?$/, permission: CATALOG_CASH_REGISTERS_READ },
  { pattern: /^\/catalogos\/proveedores\/nuevo$/, permission: CATALOG_SUPPLIERS_CREATE },
  { pattern: /^\/catalogos\/proveedores\/[^/]+\/editar$/, permission: CATALOG_SUPPLIERS_UPDATE },
  { pattern: /^\/catalogos\/proveedores\/[^/]+$/, permission: CATALOG_SUPPLIERS_READ },
  { pattern: /^\/catalogos\/proveedores(\/.*)?$/, permission: CATALOG_SUPPLIERS_READ },
  { pattern: /^\/catalogos\/proveedores-reparaciones(\/.*)?$/, permission: CATALOG_REPAIR_SUPPLIERS_READ },
  { pattern: /^\/catalogos\/usuarios\/nuevo$/, permission: CATALOG_USERS_CREATE },
  { pattern: /^\/catalogos\/usuarios\/[^/]+$/, permission: CATALOG_USERS_UPDATE },
  { pattern: /^\/catalogos\/usuarios(\/.*)?$/, permission: CATALOG_USERS_READ },
  { pattern: /^\/catalogos\/roles\/nuevo$/, permission: CATALOG_ROLES_CREATE },
  { pattern: /^\/catalogos\/roles\/[^/]+$/, permission: CATALOG_ROLES_UPDATE },
  { pattern: /^\/catalogos\/roles(\/.*)?$/, permission: CATALOG_ROLES_READ },
  { pattern: /^\/catalogos\/vendedores(\/.*)?$/, permission: CATALOG_SELLERS_READ },
  { pattern: /^\/catalogos\/mensajes(\/.*)?$/, permission: CATALOG_MESSAGES_READ },
  { pattern: /^\/catalogos\/metas(\/.*)?$/, permission: CATALOG_GOALS_READ },
  { pattern: /^\/catalogos\/costos-envio(\/.*)?$/, permission: CATALOG_SHIPPING_COSTS_READ },
  { pattern: /^\/catalogos\/folypuntos(\/.*)?$/, permission: CATALOG_POINTS_READ },
  { pattern: /^\/catalogos\/tasa-mora(\/.*)?$/, permission: CATALOG_MORATORY_RATE_READ },
];

export const authorizedHomeOptions: Array<{ path: string; requirement: AccessRequirement }> = [
  { path: "/solicitudes-credito", requirement: { permission: CREDIT_APPLICATIONS_READ } },
  { path: "/cajas", requirement: { permission: CASH_REGISTERS_READ } },
  { path: "/clientes", requirement: { permission: CUSTOMERS_READ } },
  { path: "/pedidos", requirement: { permission: ORDERS_READ } },
  { path: "/traspasos", requirement: { permission: TRASPASOS_READ } },
  { path: "/solicitudes-descuento", requirement: { permission: DISCOUNT_REQUESTS_READ } },
  { path: "/inventario", requirement: { permission: INVENTORY_READ } },
  { path: "/recepcion-mercancias", requirement: { permission: MERCHANDISE_RECEPTION_READ } },
  { path: "/costeos", requirement: { permission: COSTEOS_READ } },
  { path: "/facturas", requirement: { permission: PAYABLE_INVOICES_READ } },
  { path: "/facturas/solicitudes", requirement: { permission: INVOICE_REQUESTS_READ } },
  { path: "/facturas/gastos-generales", requirement: { permission: GENERAL_EXPENSES_READ } },
  { path: "/facturas/proveedores", requirement: { permission: SUPPLIER_PAYABLES_READ } },
  { path: "/atencion-cliente", requirement: { permission: CUSTOMER_SUPPORT_READ } },
  { path: "/rutas", requirement: { permission: ROUTES_READ } },
  { path: "/catalogos/productos", requirement: { permission: CATALOG_PRODUCTS_READ } },
  { path: "/catalogos/roles", requirement: { permission: CATALOG_ROLES_READ } },
];

export function normalizePathname(pathname: string): string {
  const [pathWithoutQuery] = pathname.split(/[?#]/);
  if (!pathWithoutQuery || pathWithoutQuery === "") return "/";
  return pathWithoutQuery.length > 1 ? pathWithoutQuery.replace(/\/$/, "") : pathWithoutQuery;
}

export function isPublicRoute(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);
  return PUBLIC_ROUTES.some((route) => normalizedPath === route);
}

/**
 * Whether the persistent app shell (sidebar + main chrome) should wrap the page.
 * Keep layout routing rules centralized here so AuthGuard and AppLayoutGate stay aligned.
 */
export function shouldUseAppLayout(pathname: string, token: string | null): boolean {
  if (shouldBypassAccessControl) {
    return true;
  }

  const normalizedPath = normalizePathname(pathname);

  if (isPublicRoute(normalizedPath) && !token) {
    return false;
  }

  return true;
}

export function isChangePasswordRoute(pathname: string): boolean {
  return normalizePathname(pathname) === CHANGE_PASSWORD_ROUTE;
}

export function isSuperAdmin(user: User | null): boolean {
  return user?.role === "admin";
}

export function hasAccessRequirement(user: User | null, requirement?: AccessRequirement): boolean {
  if (shouldBypassAccessControl) return true;
  if (!user) return false;
  if (!requirement) return true;
  if (requirement.allowAuthenticated) return true;
  if (isSuperAdmin(user)) return true;

  if (requirement.roles?.length && !requirement.roles.includes(user.role)) {
    return false;
  }

  if (requirement.permission && !user.permissions.includes(requirement.permission)) {
    return false;
  }

  if (requirement.allPermissions?.length) {
    return requirement.allPermissions.every((permission) => user.permissions.includes(permission));
  }

  if (requirement.anyPermissions?.length) {
    return requirement.anyPermissions.some((permission) => user.permissions.includes(permission));
  }

  return Boolean(requirement.roles?.length || requirement.permission);
}

export function findRouteAccessRule(pathname: string): RouteAccessRule | null {
  const normalizedPath = normalizePathname(pathname);
  return routeAccessRules.find((rule) => rule.pattern.test(normalizedPath)) ?? null;
}

export function canAccessPath(pathname: string, user: User | null): boolean {
  if (shouldBypassAccessControl) return true;
  if (isPublicRoute(pathname)) return true;
  if (!user) return false;

  const rule = findRouteAccessRule(pathname);
  return rule ? hasAccessRequirement(user, rule) : false;
}

export function getFirstAllowedRoute(user: User | null): string {
  if (!user) return "/login";

  const firstAllowed = authorizedHomeOptions.find((option) =>
    hasAccessRequirement(user, option.requirement)
  );

  return firstAllowed?.path ?? FORBIDDEN_ROUTE;
}
