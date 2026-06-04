import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Box, Button, Collapse, List, ListItemText, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";
import {
  CreditCard,
  Users,
  ClipboardList,
  Package,
  LayoutList,
  Monitor,
  Route,
  Plus,
  Van,
  HeartHandshake,
  ShoppingCart,
} from "@/components/Icons";
import {
  StyledDrawer,
  NavigationContainer,
  NavItemButton,
  NavItemIcon,
  SubItemButton,
  ExpandIcon,
  CollapseIcon,
  UserProfileContainer,
  UserAvatar,
  UserInfoContainer,
  UserEmail,
} from "./styles";
import { BanknoteArrowDown } from "lucide-react";
import { CreditApplicationIntakeModal } from "@/components/CreditApplicationIntakeModal";
import {
  QUOTATIONS_READ,
  SALES_READ,
  BRANCH_ORDERS_READ,
  BRANCH_REQUESTS_READ,
  CASH_REGISTERS_READ,
  CATALOG_BRANCHES_READ,
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
  CREDIT_APPLICATIONS_CREATE,
  CREDIT_APPLICATIONS_READ,
  CUSTOMER_COLLECTION_READ,
  CUSTOMER_DELINQUENCY_READ,
  CUSTOMER_SUPPORT_READ,
  CUSTOMERS_READ,
  DAMAGED_INVENTORY_READ,
  DISCOUNT_REQUESTS_READ,
  INVENTORY_LIQUIDATIONS_READ,
  INVENTORY_READ,
  INVENTORY_TRANSFERS_CREATE,
  MERCHANDISE_RECEPTION_READ,
  ORDERS_READ,
  ROUTES_READ,
} from "@/lib/permissions";
import { hasAccessRequirement, type AccessRequirement } from "@/lib/routeAccess";
import { authService } from "@/services/auth.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { useAuthStore } from "@/store/useAuthStore";
import NotificationInbox from "@/components/NotificationInbox/NotificationInbox";
import { useCreditApplicationDraftStore } from "@/store/useCreditApplicationDraftStore";
import { createCreditApplicationFromIntake } from "@/services/creditApplications.service";
import type { CreditApplicationBiometricsData } from "@/types/credit-application-form.types";

interface NavSubItem {
  label: string;
  path: string;
  requirement: AccessRequirement;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  requirement?: AccessRequirement;
  subItems?: NavSubItem[];
}

const ICON_SIZE = 16;

const navItems: NavItem[] = [
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
    label: "Pedidos (Sucursales)",
    path: "/pedidos/sucursales",
    icon: <Van size={ICON_SIZE} />,
    requirement: { permission: BRANCH_ORDERS_READ },
  },
  {
    label: "Solicitudes (Sucursales)",
    path: "/solicitudes/sucursales",
    icon: <ClipboardList size={ICON_SIZE} />,
    requirement: { permission: BRANCH_REQUESTS_READ },
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
      { label: "Traspasos", path: "/inventario/transpasos", requirement: { permission: INVENTORY_TRANSFERS_CREATE } },
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
      { label: "Productos", path: "/catalogos/productos", requirement: { permission: CATALOG_PRODUCTS_READ } },
      { label: "Departamentos", path: "/catalogos/departamentos", requirement: { permission: CATALOG_DEPARTMENTS_READ } },
      { label: "Promociones", path: "/catalogos/promociones", requirement: { permission: CATALOG_PROMOTIONS_READ } },
      { label: "Proveedores de reparaciones", path: "/catalogos/proveedores-reparaciones", requirement: { permission: CATALOG_REPAIR_SUPPLIERS_READ } },
      { label: "Sucursales", path: "/catalogos/sucursales", requirement: { permission: CATALOG_BRANCHES_READ } },
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

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const getInitialOpenMenus = (pathname: string, items: NavItem[] = navItems): Record<string, boolean> => {
  const menus: Record<string, boolean> = {};
  items.forEach((item) => {
    if (item.subItems) {
      const isInSubItem = item.subItems.some(
        (sub) => pathname === sub.path || pathname.startsWith(sub.path + "/")
      );
      if (isInSubItem) {
        menus[item.label] = true;
      }
    }
  });
  return menus;
};

const getInitials = (name?: string | null): string => {
  if (!name) return "US";
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "US";
};

const isPathActive = (path: string, pathname: string, siblingPaths: string[] = []): boolean => {
  const pathMatches = pathname === path || pathname.startsWith(`${path}/`);
  if (!pathMatches) return false;

  const hasMoreSpecificMatch = siblingPaths.some((otherPath) => {
    if (otherPath === path || otherPath.length <= path.length) return false;
    return pathname === otherPath || pathname.startsWith(`${otherPath}/`);
  });

  return !hasMoreSpecificMatch;
};

const filterNavItemsByAccess = (items: NavItem[], user: ReturnType<typeof useAuthStore.getState>["user"]): NavItem[] =>
  items
    .map((item) => {
      const subItems = item.subItems?.filter((subItem) => hasAccessRequirement(user, subItem.requirement));
      const canAccessItem = item.requirement ? hasAccessRequirement(user, item.requirement) : false;

      if (item.subItems) {
        if (!canAccessItem && (!subItems || subItems.length === 0)) return null;
        return { ...item, subItems };
      }

      return canAccessItem ? item : null;
    })
    .filter((item): item is NavItem => item !== null);

export function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.logout);
  const clearDraftById = useCreditApplicationDraftStore((state) => state.clearDraftById);
  const showError = useSnackbarStore((state) => state.showError);
  const visibleNavItems = useMemo(() => filterNavItemsByAccess(navItems, user), [user]);
  const canCreateCreditApplication = hasAccessRequirement(user, { permission: CREDIT_APPLICATIONS_CREATE });
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() =>
    getInitialOpenMenus(router.pathname, visibleNavItems)
  );
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);

  useEffect(() => {
    const newOpenMenus = getInitialOpenMenus(router.pathname, visibleNavItems);
    // Keep menu expansion aligned with the current route and the user's permissions.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenMenus((prev) => {
      const hasNewMenus = Object.keys(newOpenMenus).some((key) => !prev[key]);
      if (!hasNewMenus) {
        return prev;
      }
      return { ...prev, ...newOpenMenus };
    });
  }, [router.pathname, visibleNavItems]);

  const isParentActive = (item: NavItem) => {
    if (item.subItems) {
      const subPaths = item.subItems.map((sub) => sub.path);
      return item.subItems.some((sub) => isPathActive(sub.path, router.pathname, subPaths));
    }

    const siblingPaths = visibleNavItems.filter((other) => !other.subItems).map((other) => other.path);
    return isPathActive(item.path, router.pathname, siblingPaths);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleToggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleOpenNewCreditApplicationIntake = () => {
    if (isMobile) {
      onClose();
    }
    setIntakeModalOpen(true);
  };

  const NEW_CREDIT_APPLICATION_DRAFT_ID = "new-credit-application";

  const handleIntakeFinalize = async (payload: CreditApplicationBiometricsData) => {
    try {
      // Service will validate required captures and build multipart payload.
    } catch (e) {
      const message = e instanceof Error ? e.message : "Datos incompletos.";
      showError(message);
      throw e;
    }

    const { id } = await createCreditApplicationFromIntake(payload);
    clearDraftById(NEW_CREDIT_APPLICATION_DRAFT_ID);
    await router.push(`/solicitudes-credito/${id}`);
  };

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    await router.push("/login");
  };

  const drawerContent = (
    <>
      <NavigationContainer>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Image src="/logo/foly.svg" alt="Foly" width={32} height={32} />
            <Stack>
              <Typography variant="subtitle2">Folysoft</Typography>
              <Typography variant="body2" color="text.secondary">V.1.0</Typography>
            </Stack>
          </Stack>
          <NotificationInbox />
        </Stack>

        {canCreateCreditApplication && (
          <Button
            variant="outlined"
            startIcon={<Plus size={18} />}
            onClick={handleOpenNewCreditApplicationIntake}
          >
            Nueva solicitud
          </Button>
        )}

        <List component="nav" disablePadding>
          {visibleNavItems.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isOpen = openMenus[item.label] || false;
            const active = isParentActive(item);
            const subPaths = hasSubItems ? item.subItems!.map((sub) => sub.path) : [];

            return (
              <Box key={item.label}>
                <NavItemButton
                  active={active}
                  hasSubItems={hasSubItems}
                  onClick={() => {
                    if (hasSubItems) {
                      handleToggleMenu(item.label);
                    } else {
                      handleNavigation(item.path);
                    }
                  }}
                >
                  <NavItemIcon active={active}>{item.icon}</NavItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      variant: "body1",
                      noWrap: true,
                    }}
                  />
                  {hasSubItems && (isOpen ? <CollapseIcon /> : <ExpandIcon />)}
                </NavItemButton>

                {hasSubItems && (
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems!.map((subItem) => {
                        const subActive = isPathActive(subItem.path, router.pathname, subPaths);
                        return (
                          <SubItemButton
                            key={subItem.path}
                            active={subActive}
                            onClick={() => handleNavigation(subItem.path)}
                          >
                            <ListItemText
                              primary={subItem.label}
                              primaryTypographyProps={{
                                variant: "body1",
                                noWrap: true,
                              }}
                            />
                          </SubItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </NavigationContainer>

      <UserProfileContainer>
        <UserAvatar alt={user?.name ?? "Usuario"}>{getInitials(user?.name)}</UserAvatar>
        <UserInfoContainer>
          <Typography variant="subtitle2" noWrap>
            {user?.name ?? "Usuario"}
          </Typography>
          <UserEmail variant="caption" noWrap>
            {user?.email ?? "Sin correo registrado"}
          </UserEmail>
        </UserInfoContainer>
        <Button
          variant="text"
          size="small"
          color="inherit"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          <LogoutIcon fontSize="small" />
        </Button>
      </UserProfileContainer>
    </>
  );

  return (
    <>
      <StyledDrawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? open : true}
        onClose={onClose}
        isMobile={isMobile}
      >
        {drawerContent}
      </StyledDrawer>

      <CreditApplicationIntakeModal
        open={intakeModalOpen}
        onClose={() => setIntakeModalOpen(false)}
        onFinalize={handleIntakeFinalize}
      />
    </>
  );
}
