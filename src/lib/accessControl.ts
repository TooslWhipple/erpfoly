import type { User } from "@/store/useAuthStore";

const REQUIRE_AUTH_ENV_VALUE = process.env.NEXT_PUBLIC_REQUIRE_AUTH?.trim();

/**
 * Frontend access control switch.
 *
 * Set NEXT_PUBLIC_REQUIRE_AUTH=false in local development to render protected
 * screens without an authenticated user. Production always keeps auth enabled.
 */
export const shouldRequireAuthenticatedUser =
  process.env.NODE_ENV === "production" || REQUIRE_AUTH_ENV_VALUE !== "false";

export const shouldBypassAccessControl = !shouldRequireAuthenticatedUser;

/**
 * Mock user for development when auth bypass is enabled.
 * This allows the Sidebar, pages, and permission checks to render
 * without requiring an actual login.
 */
export const DEV_MOCK_USER: User = {
  id: "dev-mock-user",
  name: "Usuario Dev",
  email: "dev@folysoft.local",
  role: "admin",
  roleId: 1,
  roleName: "Administrador",
  permissions: [
    "credit_applications:read",
    "credit_applications:create",
    "credit_applications:update",
    "cash_registers:read",
    "customers:read",
    "customers:create",
    "customers:update",
    "customer_delinquency:read",
    "customer_collection:read",
    "customer_support:read",
    "orders:read",
    "orders:create",
    "branch_orders:read",
    "branch_orders:create",
    "branch_orders:update",
    "branch_requests:read",
    "discount_requests:read",
    "discount_requests:create",
    "inventory:read",
    "damaged_inventory:read",
    "inventory_liquidations:read",
    "merchandise_reception:read",
    "merchandise_reception:create",
    "costeos:read",
    "costeos:create",
    "costeos:update",
    "facturas.solicitudes.read",
    "facturas.solicitudes.create",
    "facturas.gastos_generales.read",
    "facturas.gastos_generales.create",
    "facturas.gastos_generales.update",
    "facturas.proveedores.read",
    "facturas.proveedores.create",
    "facturas.proveedores.update",
    "routes:read",
    "catalog_products:read",
    "catalog_products:create",
    "catalog_products:update",
    "catalog_departments:read",
    "catalog_departments:create",
    "catalog_departments:update",
    "catalog_promotions:read",
    "catalog_promotions:create",
    "catalog_promotions:update",
    "catalog_repair_suppliers:read",
    "catalog_branches:read",
    "catalog_branches:create",
    "catalog_suppliers:read",
    "catalog_suppliers:create",
    "catalog_suppliers:update",
    "catalog_users:read",
    "catalog_users:create",
    "catalog_users:update",
    "catalog_roles:read",
    "catalog_roles:create",
    "catalog_roles:update",
    "catalog_sellers:read",
    "catalog_messages:read",
    "catalog_goals:read",
    "catalog_shipping_costs:read",
    "catalog_points:read",
  ],
};
