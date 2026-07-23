/**
 * Canonical frontend permission codes.
 *
 * Contract with backend:
 * - Permission values use module.action format.
 * - Actions are limited to create, read, update and delete.
 * - Sensitive operations are authorized with the module update permission.
 * - Backend must return the user's effective permissions in login and /auth/me.
 */

export const CRUD_ACTIONS = ["create", "read", "update", "delete"] as const;

export type CrudAction = (typeof CRUD_ACTIONS)[number];

export type PermissionModule =
  | "solicitudes_credito"
  | "cajas"
  | "clientes"
  | "clientes.morosidad"
  | "clientes.cobranza"
  | "pedidos"
  | "traspasos"
  | "solicitudes_descuento"
  | "inventario"
  | "inventario.mercancia_danada"
  | "inventario.liquidaciones"
  | "recepcion_mercancias"
  | "costeos"
  | "atencion_cliente"
  | "atencion_cliente.facturas"
  | "atencion_cliente.reparaciones"
  | "rutas"
  | "catalogos.productos"
  | "catalogos.departamentos"
  | "catalogos.promociones"
  | "catalogos.sucursales"
  | "catalogos.cajas"
  | "catalogos.proveedores"
  | "catalogos.proveedores_reparaciones"
  | "catalogos.usuarios"
  | "catalogos.vendedores"
  | "catalogos.roles"
  | "catalogos.mensajes"
  | "catalogos.metas"
  | "catalogos.costos_envio"
  | "catalogos.folypuntos"
  | "ventas"
  | "cotizaciones"
  | "reportes";

export type PermissionCode = `${PermissionModule}.${CrudAction}`;

type CrudPermissionSet<TModule extends PermissionModule> = {
  readonly create: `${TModule}.create`;
  readonly read: `${TModule}.read`;
  readonly update: `${TModule}.update`;
  readonly delete: `${TModule}.delete`;
};

function createCrudPermissions<TModule extends PermissionModule>(
  module: TModule
): CrudPermissionSet<TModule> {
  return {
    create: `${module}.create`,
    read: `${module}.read`,
    update: `${module}.update`,
    delete: `${module}.delete`,
  } as CrudPermissionSet<TModule>;
}

// Credit applications
export const CREDIT_APPLICATIONS_PERMISSIONS = createCrudPermissions("solicitudes_credito");
export const CREDIT_APPLICATIONS_CREATE = CREDIT_APPLICATIONS_PERMISSIONS.create;
export const CREDIT_APPLICATIONS_READ = CREDIT_APPLICATIONS_PERMISSIONS.read;
export const CREDIT_APPLICATIONS_UPDATE = CREDIT_APPLICATIONS_PERMISSIONS.update;
export const CREDIT_APPLICATIONS_DELETE = CREDIT_APPLICATIONS_PERMISSIONS.delete;

// Cash registers
export const CASH_REGISTERS_PERMISSIONS = createCrudPermissions("cajas");
export const CASH_REGISTERS_CREATE = CASH_REGISTERS_PERMISSIONS.create;
export const CASH_REGISTERS_READ = CASH_REGISTERS_PERMISSIONS.read;
export const CASH_REGISTERS_UPDATE = CASH_REGISTERS_PERMISSIONS.update;
export const CASH_REGISTERS_DELETE = CASH_REGISTERS_PERMISSIONS.delete;

// Customers
export const CUSTOMERS_PERMISSIONS = createCrudPermissions("clientes");
export const CUSTOMERS_CREATE = CUSTOMERS_PERMISSIONS.create;
export const CUSTOMERS_READ = CUSTOMERS_PERMISSIONS.read;
export const CUSTOMERS_UPDATE = CUSTOMERS_PERMISSIONS.update;
export const CUSTOMERS_DELETE = CUSTOMERS_PERMISSIONS.delete;

export const CUSTOMER_DELINQUENCY_PERMISSIONS = createCrudPermissions("clientes.morosidad");
export const CUSTOMER_DELINQUENCY_CREATE = CUSTOMER_DELINQUENCY_PERMISSIONS.create;
export const CUSTOMER_DELINQUENCY_READ = CUSTOMER_DELINQUENCY_PERMISSIONS.read;
export const CUSTOMER_DELINQUENCY_UPDATE = CUSTOMER_DELINQUENCY_PERMISSIONS.update;
export const CUSTOMER_DELINQUENCY_DELETE = CUSTOMER_DELINQUENCY_PERMISSIONS.delete;

export const CUSTOMER_COLLECTION_PERMISSIONS = createCrudPermissions("clientes.cobranza");
export const CUSTOMER_COLLECTION_CREATE = CUSTOMER_COLLECTION_PERMISSIONS.create;
export const CUSTOMER_COLLECTION_READ = CUSTOMER_COLLECTION_PERMISSIONS.read;
export const CUSTOMER_COLLECTION_UPDATE = CUSTOMER_COLLECTION_PERMISSIONS.update;
export const CUSTOMER_COLLECTION_DELETE = CUSTOMER_COLLECTION_PERMISSIONS.delete;

// Orders
export const ORDERS_PERMISSIONS = createCrudPermissions("pedidos");
export const ORDERS_CREATE = ORDERS_PERMISSIONS.create;
export const ORDERS_READ = ORDERS_PERMISSIONS.read;
export const ORDERS_UPDATE = ORDERS_PERMISSIONS.update;
export const ORDERS_DELETE = ORDERS_PERMISSIONS.delete;

export const TRASPASOS_PERMISSIONS = createCrudPermissions("traspasos");
export const TRASPASOS_CREATE = TRASPASOS_PERMISSIONS.create;
export const TRASPASOS_READ = TRASPASOS_PERMISSIONS.read;
export const TRASPASOS_UPDATE = TRASPASOS_PERMISSIONS.update;
export const TRASPASOS_DELETE = TRASPASOS_PERMISSIONS.delete;

export const DISCOUNT_REQUESTS_PERMISSIONS = createCrudPermissions("solicitudes_descuento");
export const DISCOUNT_REQUESTS_CREATE = DISCOUNT_REQUESTS_PERMISSIONS.create;
export const DISCOUNT_REQUESTS_READ = DISCOUNT_REQUESTS_PERMISSIONS.read;
export const DISCOUNT_REQUESTS_UPDATE = DISCOUNT_REQUESTS_PERMISSIONS.update;
export const DISCOUNT_REQUESTS_DELETE = DISCOUNT_REQUESTS_PERMISSIONS.delete;

// Inventory
export const INVENTORY_PERMISSIONS = createCrudPermissions("inventario");
export const INVENTORY_CREATE = INVENTORY_PERMISSIONS.create;
export const INVENTORY_READ = INVENTORY_PERMISSIONS.read;
export const INVENTORY_UPDATE = INVENTORY_PERMISSIONS.update;
export const INVENTORY_DELETE = INVENTORY_PERMISSIONS.delete;

export const DAMAGED_INVENTORY_PERMISSIONS = createCrudPermissions("inventario.mercancia_danada");
export const DAMAGED_INVENTORY_CREATE = DAMAGED_INVENTORY_PERMISSIONS.create;
export const DAMAGED_INVENTORY_READ = DAMAGED_INVENTORY_PERMISSIONS.read;
export const DAMAGED_INVENTORY_UPDATE = DAMAGED_INVENTORY_PERMISSIONS.update;
export const DAMAGED_INVENTORY_DELETE = DAMAGED_INVENTORY_PERMISSIONS.delete;

export const INVENTORY_LIQUIDATIONS_PERMISSIONS = createCrudPermissions("inventario.liquidaciones");
export const INVENTORY_LIQUIDATIONS_CREATE = INVENTORY_LIQUIDATIONS_PERMISSIONS.create;
export const INVENTORY_LIQUIDATIONS_READ = INVENTORY_LIQUIDATIONS_PERMISSIONS.read;
export const INVENTORY_LIQUIDATIONS_UPDATE = INVENTORY_LIQUIDATIONS_PERMISSIONS.update;
export const INVENTORY_LIQUIDATIONS_DELETE = INVENTORY_LIQUIDATIONS_PERMISSIONS.delete;

// Merchandise reception
export const MERCHANDISE_RECEPTION_PERMISSIONS = createCrudPermissions("recepcion_mercancias");
export const MERCHANDISE_RECEPTION_CREATE = MERCHANDISE_RECEPTION_PERMISSIONS.create;
export const MERCHANDISE_RECEPTION_READ = MERCHANDISE_RECEPTION_PERMISSIONS.read;
export const MERCHANDISE_RECEPTION_UPDATE = MERCHANDISE_RECEPTION_PERMISSIONS.update;
export const MERCHANDISE_RECEPTION_DELETE = MERCHANDISE_RECEPTION_PERMISSIONS.delete;

// Costeos
export const COSTEOS_PERMISSIONS = createCrudPermissions("costeos");
export const COSTEOS_CREATE = COSTEOS_PERMISSIONS.create;
export const COSTEOS_READ = COSTEOS_PERMISSIONS.read;
export const COSTEOS_UPDATE = COSTEOS_PERMISSIONS.update;
export const COSTEOS_DELETE = COSTEOS_PERMISSIONS.delete;

// Customer support
export const CUSTOMER_SUPPORT_PERMISSIONS = createCrudPermissions("atencion_cliente");
export const CUSTOMER_SUPPORT_CREATE = CUSTOMER_SUPPORT_PERMISSIONS.create;
export const CUSTOMER_SUPPORT_READ = CUSTOMER_SUPPORT_PERMISSIONS.read;
export const CUSTOMER_SUPPORT_UPDATE = CUSTOMER_SUPPORT_PERMISSIONS.update;
export const CUSTOMER_SUPPORT_DELETE = CUSTOMER_SUPPORT_PERMISSIONS.delete;

export const CUSTOMER_SUPPORT_INVOICES_PERMISSIONS = createCrudPermissions("atencion_cliente.facturas");
export const CUSTOMER_SUPPORT_INVOICES_CREATE = CUSTOMER_SUPPORT_INVOICES_PERMISSIONS.create;
export const CUSTOMER_SUPPORT_INVOICES_READ = CUSTOMER_SUPPORT_INVOICES_PERMISSIONS.read;
export const CUSTOMER_SUPPORT_INVOICES_UPDATE = CUSTOMER_SUPPORT_INVOICES_PERMISSIONS.update;
export const CUSTOMER_SUPPORT_INVOICES_DELETE = CUSTOMER_SUPPORT_INVOICES_PERMISSIONS.delete;

export const CUSTOMER_SUPPORT_REPAIRS_PERMISSIONS = createCrudPermissions("atencion_cliente.reparaciones");
export const CUSTOMER_SUPPORT_REPAIRS_CREATE = CUSTOMER_SUPPORT_REPAIRS_PERMISSIONS.create;
export const CUSTOMER_SUPPORT_REPAIRS_READ = CUSTOMER_SUPPORT_REPAIRS_PERMISSIONS.read;
export const CUSTOMER_SUPPORT_REPAIRS_UPDATE = CUSTOMER_SUPPORT_REPAIRS_PERMISSIONS.update;
export const CUSTOMER_SUPPORT_REPAIRS_DELETE = CUSTOMER_SUPPORT_REPAIRS_PERMISSIONS.delete;

// Routes
export const ROUTES_PERMISSIONS = createCrudPermissions("rutas");
export const ROUTES_CREATE = ROUTES_PERMISSIONS.create;
export const ROUTES_READ = ROUTES_PERMISSIONS.read;
export const ROUTES_UPDATE = ROUTES_PERMISSIONS.update;
export const ROUTES_DELETE = ROUTES_PERMISSIONS.delete;

// Catalogs
export const CATALOG_PRODUCTS_PERMISSIONS = createCrudPermissions("catalogos.productos");
export const CATALOG_PRODUCTS_CREATE = CATALOG_PRODUCTS_PERMISSIONS.create;
export const CATALOG_PRODUCTS_READ = CATALOG_PRODUCTS_PERMISSIONS.read;
export const CATALOG_PRODUCTS_UPDATE = CATALOG_PRODUCTS_PERMISSIONS.update;
export const CATALOG_PRODUCTS_DELETE = CATALOG_PRODUCTS_PERMISSIONS.delete;

export const CATALOG_DEPARTMENTS_PERMISSIONS = createCrudPermissions("catalogos.departamentos");
export const CATALOG_DEPARTMENTS_CREATE = CATALOG_DEPARTMENTS_PERMISSIONS.create;
export const CATALOG_DEPARTMENTS_READ = CATALOG_DEPARTMENTS_PERMISSIONS.read;
export const CATALOG_DEPARTMENTS_UPDATE = CATALOG_DEPARTMENTS_PERMISSIONS.update;
export const CATALOG_DEPARTMENTS_DELETE = CATALOG_DEPARTMENTS_PERMISSIONS.delete;

export const CATALOG_PROMOTIONS_PERMISSIONS = createCrudPermissions("catalogos.promociones");
export const CATALOG_PROMOTIONS_CREATE = CATALOG_PROMOTIONS_PERMISSIONS.create;
export const CATALOG_PROMOTIONS_READ = CATALOG_PROMOTIONS_PERMISSIONS.read;
export const CATALOG_PROMOTIONS_UPDATE = CATALOG_PROMOTIONS_PERMISSIONS.update;
export const CATALOG_PROMOTIONS_DELETE = CATALOG_PROMOTIONS_PERMISSIONS.delete;

export const CATALOG_BRANCHES_PERMISSIONS = createCrudPermissions("catalogos.sucursales");
export const CATALOG_BRANCHES_CREATE = CATALOG_BRANCHES_PERMISSIONS.create;
export const CATALOG_BRANCHES_READ = CATALOG_BRANCHES_PERMISSIONS.read;
export const CATALOG_BRANCHES_UPDATE = CATALOG_BRANCHES_PERMISSIONS.update;
export const CATALOG_BRANCHES_DELETE = CATALOG_BRANCHES_PERMISSIONS.delete;

export const CATALOG_CASH_REGISTERS_PERMISSIONS = createCrudPermissions("catalogos.cajas");
export const CATALOG_CASH_REGISTERS_CREATE = CATALOG_CASH_REGISTERS_PERMISSIONS.create;
export const CATALOG_CASH_REGISTERS_READ = CATALOG_CASH_REGISTERS_PERMISSIONS.read;
export const CATALOG_CASH_REGISTERS_UPDATE = CATALOG_CASH_REGISTERS_PERMISSIONS.update;
export const CATALOG_CASH_REGISTERS_DELETE = CATALOG_CASH_REGISTERS_PERMISSIONS.delete;

export const CATALOG_SUPPLIERS_PERMISSIONS = createCrudPermissions("catalogos.proveedores");
export const CATALOG_SUPPLIERS_CREATE = CATALOG_SUPPLIERS_PERMISSIONS.create;
export const CATALOG_SUPPLIERS_READ = CATALOG_SUPPLIERS_PERMISSIONS.read;
export const CATALOG_SUPPLIERS_UPDATE = CATALOG_SUPPLIERS_PERMISSIONS.update;
export const CATALOG_SUPPLIERS_DELETE = CATALOG_SUPPLIERS_PERMISSIONS.delete;

export const CATALOG_REPAIR_SUPPLIERS_PERMISSIONS = createCrudPermissions("catalogos.proveedores_reparaciones");
export const CATALOG_REPAIR_SUPPLIERS_CREATE = CATALOG_REPAIR_SUPPLIERS_PERMISSIONS.create;
export const CATALOG_REPAIR_SUPPLIERS_READ = CATALOG_REPAIR_SUPPLIERS_PERMISSIONS.read;
export const CATALOG_REPAIR_SUPPLIERS_UPDATE = CATALOG_REPAIR_SUPPLIERS_PERMISSIONS.update;
export const CATALOG_REPAIR_SUPPLIERS_DELETE = CATALOG_REPAIR_SUPPLIERS_PERMISSIONS.delete;

export const CATALOG_USERS_PERMISSIONS = createCrudPermissions("catalogos.usuarios");
export const CATALOG_USERS_CREATE = CATALOG_USERS_PERMISSIONS.create;
export const CATALOG_USERS_READ = CATALOG_USERS_PERMISSIONS.read;
export const CATALOG_USERS_UPDATE = CATALOG_USERS_PERMISSIONS.update;
export const CATALOG_USERS_DELETE = CATALOG_USERS_PERMISSIONS.delete;

export const CATALOG_SELLERS_PERMISSIONS = createCrudPermissions("catalogos.vendedores");
export const CATALOG_SELLERS_CREATE = CATALOG_SELLERS_PERMISSIONS.create;
export const CATALOG_SELLERS_READ = CATALOG_SELLERS_PERMISSIONS.read;
export const CATALOG_SELLERS_UPDATE = CATALOG_SELLERS_PERMISSIONS.update;
export const CATALOG_SELLERS_DELETE = CATALOG_SELLERS_PERMISSIONS.delete;

export const CATALOG_ROLES_PERMISSIONS = createCrudPermissions("catalogos.roles");
export const CATALOG_ROLES_CREATE = CATALOG_ROLES_PERMISSIONS.create;
export const CATALOG_ROLES_READ = CATALOG_ROLES_PERMISSIONS.read;
export const CATALOG_ROLES_UPDATE = CATALOG_ROLES_PERMISSIONS.update;
export const CATALOG_ROLES_DELETE = CATALOG_ROLES_PERMISSIONS.delete;

export const CATALOG_MESSAGES_PERMISSIONS = createCrudPermissions("catalogos.mensajes");
export const CATALOG_MESSAGES_CREATE = CATALOG_MESSAGES_PERMISSIONS.create;
export const CATALOG_MESSAGES_READ = CATALOG_MESSAGES_PERMISSIONS.read;
export const CATALOG_MESSAGES_UPDATE = CATALOG_MESSAGES_PERMISSIONS.update;
export const CATALOG_MESSAGES_DELETE = CATALOG_MESSAGES_PERMISSIONS.delete;

export const CATALOG_GOALS_PERMISSIONS = createCrudPermissions("catalogos.metas");
export const CATALOG_GOALS_CREATE = CATALOG_GOALS_PERMISSIONS.create;
export const CATALOG_GOALS_READ = CATALOG_GOALS_PERMISSIONS.read;
export const CATALOG_GOALS_UPDATE = CATALOG_GOALS_PERMISSIONS.update;
export const CATALOG_GOALS_DELETE = CATALOG_GOALS_PERMISSIONS.delete;

export const CATALOG_SHIPPING_COSTS_PERMISSIONS = createCrudPermissions("catalogos.costos_envio");
export const CATALOG_SHIPPING_COSTS_CREATE = CATALOG_SHIPPING_COSTS_PERMISSIONS.create;
export const CATALOG_SHIPPING_COSTS_READ = CATALOG_SHIPPING_COSTS_PERMISSIONS.read;
export const CATALOG_SHIPPING_COSTS_UPDATE = CATALOG_SHIPPING_COSTS_PERMISSIONS.update;
export const CATALOG_SHIPPING_COSTS_DELETE = CATALOG_SHIPPING_COSTS_PERMISSIONS.delete;

export const CATALOG_POINTS_PERMISSIONS = createCrudPermissions("catalogos.folypuntos");
export const CATALOG_POINTS_CREATE = CATALOG_POINTS_PERMISSIONS.create;
export const CATALOG_POINTS_READ = CATALOG_POINTS_PERMISSIONS.read;
export const CATALOG_POINTS_UPDATE = CATALOG_POINTS_PERMISSIONS.update;
export const CATALOG_POINTS_DELETE = CATALOG_POINTS_PERMISSIONS.delete;

// Sales (Ventas)
export const SALES_PERMISSIONS = createCrudPermissions("ventas");
export const SALES_CREATE = SALES_PERMISSIONS.create;
export const SALES_READ = SALES_PERMISSIONS.read;
export const SALES_UPDATE = SALES_PERMISSIONS.update;
export const SALES_DELETE = SALES_PERMISSIONS.delete;

// Cotizaciones
export const QUOTATIONS_PERMISSIONS = createCrudPermissions("cotizaciones");
export const QUOTATIONS_CREATE = QUOTATIONS_PERMISSIONS.create;
export const QUOTATIONS_READ = QUOTATIONS_PERMISSIONS.read;
export const QUOTATIONS_UPDATE = QUOTATIONS_PERMISSIONS.update;
export const QUOTATIONS_DELETE = QUOTATIONS_PERMISSIONS.delete;

// Reports
export const REPORTS_PERMISSIONS = createCrudPermissions("reportes");
export const REPORTS_CREATE = REPORTS_PERMISSIONS.create;
export const REPORTS_READ = REPORTS_PERMISSIONS.read;
export const REPORTS_UPDATE = REPORTS_PERMISSIONS.update;
export const REPORTS_DELETE = REPORTS_PERMISSIONS.delete;

export const PERMISSIONS_BY_MODULE = {
  creditApplications: Object.values(CREDIT_APPLICATIONS_PERMISSIONS),
  cashRegisters: Object.values(CASH_REGISTERS_PERMISSIONS),
  customers: {
    customers: Object.values(CUSTOMERS_PERMISSIONS),
    delinquency: Object.values(CUSTOMER_DELINQUENCY_PERMISSIONS),
    collection: Object.values(CUSTOMER_COLLECTION_PERMISSIONS),
  },
  orders: {
    orders: Object.values(ORDERS_PERMISSIONS),
    traspasos: Object.values(TRASPASOS_PERMISSIONS),
    discountRequests: Object.values(DISCOUNT_REQUESTS_PERMISSIONS),
  },
  inventory: {
    inventory: Object.values(INVENTORY_PERMISSIONS),
    damagedInventory: Object.values(DAMAGED_INVENTORY_PERMISSIONS),
    liquidations: Object.values(INVENTORY_LIQUIDATIONS_PERMISSIONS),
  },
  merchandiseReception: Object.values(MERCHANDISE_RECEPTION_PERMISSIONS),
  costeos: Object.values(COSTEOS_PERMISSIONS),
  customerSupport: {
    customerSupport: Object.values(CUSTOMER_SUPPORT_PERMISSIONS),
    invoices: Object.values(CUSTOMER_SUPPORT_INVOICES_PERMISSIONS),
    repairs: Object.values(CUSTOMER_SUPPORT_REPAIRS_PERMISSIONS),
  },
  routes: Object.values(ROUTES_PERMISSIONS),
  catalogs: {
    products: Object.values(CATALOG_PRODUCTS_PERMISSIONS),
    departments: Object.values(CATALOG_DEPARTMENTS_PERMISSIONS),
    promotions: Object.values(CATALOG_PROMOTIONS_PERMISSIONS),
    branches: Object.values(CATALOG_BRANCHES_PERMISSIONS),
    cashRegisters: Object.values(CATALOG_CASH_REGISTERS_PERMISSIONS),
    suppliers: Object.values(CATALOG_SUPPLIERS_PERMISSIONS),
    repairSuppliers: Object.values(CATALOG_REPAIR_SUPPLIERS_PERMISSIONS),
    users: Object.values(CATALOG_USERS_PERMISSIONS),
    sellers: Object.values(CATALOG_SELLERS_PERMISSIONS),
    roles: Object.values(CATALOG_ROLES_PERMISSIONS),
    messages: Object.values(CATALOG_MESSAGES_PERMISSIONS),
    goals: Object.values(CATALOG_GOALS_PERMISSIONS),
    shippingCosts: Object.values(CATALOG_SHIPPING_COSTS_PERMISSIONS),
    points: Object.values(CATALOG_POINTS_PERMISSIONS),
  },
  sales: Object.values(SALES_PERMISSIONS),
  quotations: Object.values(QUOTATIONS_PERMISSIONS),
  reports: Object.values(REPORTS_PERMISSIONS),
} as const;
