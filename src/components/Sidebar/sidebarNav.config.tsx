import {
  CreditCard,
  Users,
  ClipboardList,
  Package,
  LayoutList,
  Monitor,
  Route,
  Van,
  HeartHandshake,
  ShoppingCart,
} from "@/components/Icons";
import { BanknoteArrowDown } from "lucide-react";
import {
  QUOTATIONS_READ,
  SALES_READ,
  TRASPASOS_READ,
  CASH_REGISTERS_READ,
  CATALOG_BRANCHES_READ,
  CATALOG_CASH_REGISTERS_READ,
  CATALOG_DEPARTMENTS_READ,
  CATALOG_GOALS_READ,
  CATALOG_MESSAGES_READ,
  CATALOG_POINTS_READ,
  CATALOG_PRODUCTS_READ,
  CATALOG_PROMOTIONS_READ,
  CATALOG_REPAIR_SUPPLIERS_READ,
  CATALOG_ROLES_READ,
  CATALOG_SELLERS_READ,
  CATALOG_SHIPPING_COSTS_READ,
  CATALOG_SUPPLIERS_READ,
  CATALOG_USERS_READ,
  CREDIT_APPLICATIONS_READ,
  CUSTOMER_COLLECTION_READ,
  CUSTOMER_DELINQUENCY_READ,
  CUSTOMER_SUPPORT_READ,
  CUSTOMERS_READ,
  DAMAGED_INVENTORY_READ,
  DISCOUNT_REQUESTS_READ,
  INVENTORY_LIQUIDATIONS_READ,
  INVENTORY_READ,
  MERCHANDISE_RECEPTION_READ,
  ORDERS_READ,
  ROUTES_READ,
} from "@/lib/permissions";
import type { AccessRequirement } from "@/lib/routeAccess";
import { ROLE_CODES } from "@/constants/role-codes";

export interface NavSubItem {
  label: string;
  path: string;
  requirement: AccessRequirement;
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  requirement?: AccessRequirement;
  subItems?: NavSubItem[];
}

const ICON_SIZE = 16;

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Solicitudes de crédito",
    path: "/solicitudes-credito",
    icon: <CreditCard size={ICON_SIZE} />,
    requirement: { permission: CREDIT_APPLICATIONS_READ },
  },
  {
    label: "Ventas",
    path: "/ventas",
    icon: <ShoppingCart size={ICON_SIZE} />,
    requirement: { permission: SALES_READ },
    subItems: [
      { label: "Todas las ventas", path: "/ventas", requirement: { permission: SALES_READ } },
      { label: "Ventas en rojo", path: "/ventas/en-rojo", requirement: { roles: [ROLE_CODES.ADMINISTRADOR] } },
    ],
  },
  {
    label: "Cotizaciones guardadas",
    path: "/cotizaciones-guardadas",
    icon: <ClipboardList size={ICON_SIZE} />,
    requirement: { permission: QUOTATIONS_READ },
  },
  { label: "Cajas", path: "/cajas", icon: <Monitor size={ICON_SIZE} />, requirement: { permission: CASH_REGISTERS_READ } },
  {
    label: "Clientes",
    path: "/clientes",
    icon: <Users size={ICON_SIZE} />,
    requirement: { permission: CUSTOMERS_READ },
    subItems: [
      { label: "Clientes", path: "/clientes", requirement: { permission: CUSTOMERS_READ } },
      { label: "Clientes con morosidad", path: "/clientes/morosidad", requirement: { permission: CUSTOMER_DELINQUENCY_READ } },
      { label: "Cobranza automática", path: "/clientes/cobranza", requirement: { permission: CUSTOMER_COLLECTION_READ } },
    ],
  },
  { label: "Pedidos", path: "/pedidos", icon: <Van size={ICON_SIZE} />, requirement: { permission: ORDERS_READ } },
  {
    label: "Traspasos",
    path: "/traspasos",
    icon: <ClipboardList size={ICON_SIZE} />,
    requirement: { permission: TRASPASOS_READ },
  },
  {
    label: "Solicitudes de descuento",
    path: "/solicitudes-descuento",
    icon: <BanknoteArrowDown size={ICON_SIZE} />,
    requirement: { permission: DISCOUNT_REQUESTS_READ },
  },
  {
    label: "Inventario",
    path: "/inventario",
    icon: <Package size={ICON_SIZE} />,
    requirement: { permission: INVENTORY_READ },
    subItems: [
      { label: "Inventario", path: "/inventario", requirement: { permission: INVENTORY_READ } },
      { label: "Mercancía dañada", path: "/inventario/mercancia-danada", requirement: { permission: DAMAGED_INVENTORY_READ } },
      { label: "Liquidaciones", path: "/inventario/liquidaciones", requirement: { permission: INVENTORY_LIQUIDATIONS_READ } },
    ],
  },
  {
    label: "Recepción de mercancía",
    path: "/recepcion-mercancias",
    icon: <Package size={ICON_SIZE} />,
    requirement: { permission: MERCHANDISE_RECEPTION_READ },
  },
  {
    label: "Atención a cliente",
    path: "/atencion-cliente",
    icon: <HeartHandshake size={ICON_SIZE} />,
    requirement: { permission: CUSTOMER_SUPPORT_READ },
  },
  { label: "Rutas", path: "/rutas", icon: <Route size={ICON_SIZE} />, requirement: { permission: ROUTES_READ } },
  {
    label: "Catálogos",
    path: "/catalogos",
    icon: <LayoutList size={ICON_SIZE} />,
    subItems: [
      { label: "Artículos", path: "/catalogos/productos", requirement: { permission: CATALOG_PRODUCTS_READ } },
      { label: "Departamentos", path: "/catalogos/departamentos", requirement: { permission: CATALOG_DEPARTMENTS_READ } },
      { label: "Promociones", path: "/catalogos/promociones", requirement: { permission: CATALOG_PROMOTIONS_READ } },
      { label: "Proveedores de reparaciones", path: "/catalogos/proveedores-reparaciones", requirement: { permission: CATALOG_REPAIR_SUPPLIERS_READ } },
      { label: "Sucursales", path: "/catalogos/sucursales", requirement: { permission: CATALOG_BRANCHES_READ } },
      { label: "Cajas", path: "/catalogos/cajas", requirement: { permission: CATALOG_CASH_REGISTERS_READ } },
      { label: "Proveedores", path: "/catalogos/proveedores", requirement: { permission: CATALOG_SUPPLIERS_READ } },
      { label: "Mensajes", path: "/catalogos/mensajes", requirement: { permission: CATALOG_MESSAGES_READ } },
      { label: "Metas", path: "/catalogos/metas", requirement: { permission: CATALOG_GOALS_READ } },
      { label: "Costo de envío", path: "/catalogos/costos-envio", requirement: { permission: CATALOG_SHIPPING_COSTS_READ } },
      { label: "Folypuntos", path: "/catalogos/folypuntos", requirement: { permission: CATALOG_POINTS_READ } },
      { label: "Roles", path: "/catalogos/roles", requirement: { permission: CATALOG_ROLES_READ } },
      { label: "Usuarios", path: "/catalogos/usuarios", requirement: { permission: CATALOG_USERS_READ } },
      { label: "Vendedores", path: "/catalogos/vendedores", requirement: { permission: CATALOG_SELLERS_READ } },
    ],
  },
];
