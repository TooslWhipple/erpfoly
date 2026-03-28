import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Box, Button, Collapse, List, ListItemText, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
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
  HeartHandshake
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

interface NavSubItem {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  subItems?: NavSubItem[];
}

const ICON_SIZE = 16;

const navItems: NavItem[] = [
  { label: "Solicitudes de crédito", path: "/solicitudes-credito", icon: <CreditCard size={ICON_SIZE} /> },
  { label: "Cajas", path: "/cajas", icon: <Monitor size={ICON_SIZE} /> },
  {
    label: "Clientes",
    path: "/clientes",
    icon: <Users size={ICON_SIZE} />,
    subItems: [
      { label: "Clientes", path: "/clientes" },
      { label: "Clientes con morosidad", path: "/clientes/morosidad" },
      { label: "Cobranza automática", path: "/clientes/cobranza" },
    ],
  },
  { label: "Pedidos", path: "/pedidos", icon: <Van size={ICON_SIZE} /> },
  { label: "Pedidos (Sucursales)", path: "/pedidos/sucursales", icon: <Van size={ICON_SIZE} /> },
  { label: "Solicitudes (Sucursales)", path: "/solicitudes/sucursales", icon: <ClipboardList size={ICON_SIZE} /> },
  { label: "Solicitudes de descuento", path: "/solicitudes-descuento", icon: <BanknoteArrowDown size={ICON_SIZE} /> },
  {
    label: "Inventario",
    path: "/inventario",
    icon: <Package size={ICON_SIZE} />,
    subItems: [
      { label: "Inventario", path: "/inventario" },
      { label: "Mercancía dañada", path: "/inventario/mercancia-danada" },
      { label: "Liquidaciones", path: "/inventario/liquidaciones" },
      { label: "Traspasos", path: "/inventario/transpasos" },
    ],
  },
  { label: "Atención a cliente", path: "/atencion-cliente", icon: <HeartHandshake size={ICON_SIZE} /> },
  { label: "Rutas", path: "/rutas", icon: <Route size={ICON_SIZE} /> },
  {
    label: "Catálogos",
    path: "/catalogos",
    icon: <LayoutList size={ICON_SIZE} />,
    subItems: [
      { label: "Productos", path: "/catalogos/productos" },
      { label: "Departamentos", path: "/catalogos/departamentos" },
      { label: "Promociones", path: "/catalogos/promociones" },
      { label: "Proveedores de reparaciones", path: "/catalogos/proveedores-reparaciones" },
      { label: "Sucursales", path: "/catalogos/sucursales" },
      { label: "Proveedores", path: "/catalogos/proveedores" },
      { label: "Mensajes", path: "/catalogos/mensajes" },
      { label: "Metas", path: "/catalogos/metas" },
      { label: "Costo de envío", path: "/catalogos/costos-envio" },
      { label: "Folypuntos", path: "/catalogos/folypuntos" },
      { label: "Roles", path: "/catalogos/roles" },
      { label: "Usuarios", path: "/catalogos/usuarios" },
      { label: "Vendedores", path: "/catalogos/vendedores" },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const getInitialOpenMenus = (pathname: string): Record<string, boolean> => {
  const menus: Record<string, boolean> = {};
  navItems.forEach((item) => {
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

export function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() =>
    getInitialOpenMenus(router.pathname)
  );
  const previousPathname = useRef(router.pathname);

  useEffect(() => {
    if (previousPathname.current !== router.pathname) {
      previousPathname.current = router.pathname;
      const newOpenMenus = getInitialOpenMenus(router.pathname);
      // We need to update state when pathname changes to open relevant menus
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenMenus((prev) => {
        const hasNewMenus = Object.keys(newOpenMenus).some((key) => !prev[key]);
        if (!hasNewMenus) {
          return prev;
        }
        return { ...prev, ...newOpenMenus };
      });
    }
  }, [router.pathname]);

  const isParentActive = (item: NavItem) => {
    if (item.subItems) {
      return item.subItems.some((sub) => router.pathname === sub.path);
    }

    // Check if current path matches this item
    const pathMatches = router.pathname === item.path || router.pathname.startsWith(item.path + "/");

    if (!pathMatches) {
      return false;
    }

    // If path matches, check if there's a more specific item that also matches
    // This prevents shorter paths from being active when a longer path is active
    const hasMoreSpecificMatch = navItems.some((otherItem) => {
      if (otherItem === item) return false;
      if (otherItem.subItems) return false;

      const otherPathMatches = router.pathname === otherItem.path || router.pathname.startsWith(otherItem.path + "/");
      if (!otherPathMatches) return false;

      // Check if the other item's path is longer (more specific)
      return otherItem.path.length > item.path.length;
    });

    // Only active if no more specific match exists
    return !hasMoreSpecificMatch;
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

  const drawerContent = (
    <>
      <NavigationContainer>
        <Stack direction="row" alignItems="center" spacing={1}>
          <img src="/logo/foly.svg" alt="Foly" width={32} height={32} />
          <Stack>
            <Typography variant="subtitle2">Folysoft</Typography>
            <Typography variant="body2" color="text.secondary">V.1.0</Typography>
          </Stack>
        </Stack>

        <Button
          variant="outlined"
          startIcon={<Plus size={18} />}
          onClick={() => handleNavigation("/solicitudes-credito/nueva")}
        >
          Nueva solicitud
        </Button>

        <List component="nav" disablePadding>
          {navItems.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isOpen = openMenus[item.label] || false;
            const active = isParentActive(item);

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
                        const subActive =
                          router.pathname === subItem.path ||
                          router.pathname.startsWith(`${subItem.path}/`);
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
        <UserAvatar alt="Usuario">AZ</UserAvatar>
        <UserInfoContainer>
          <Typography variant="subtitle2" noWrap>
            Antonio Zamudio
          </Typography>
          <UserEmail variant="caption" noWrap>
            antonio@folysoft.com
          </UserEmail>
        </UserInfoContainer>
      </UserProfileContainer>
    </>
  );

  return (
    <StyledDrawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? open : true}
      onClose={onClose}
      isMobile={isMobile}
    >
      {drawerContent}
    </StyledDrawer>
  );
}
