import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Box, Collapse, List, ListItemText, Typography, useMediaQuery, useTheme } from "@mui/material";
import {
  CreditCard as CreditCardIcon,
  PointOfSale as PointOfSaleIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Store as StoreIcon,
  Assignment as AssignmentIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory as InventoryIcon,
  Support as SupportIcon,
  Route as RouteIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import {
  StyledDrawer,
  HeaderContainer,
  LogoBox,
  LogoText,
  BrandName,
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

const navItems: NavItem[] = [
  { label: "Solicitudes de crédito", path: "/solicitudes-credito", icon: <CreditCardIcon /> },
  { label: "Cajas", path: "/cajas", icon: <PointOfSaleIcon /> },
  {
    label: "Clientes",
    path: "/clientes",
    icon: <PeopleIcon />,
    subItems: [
      { label: "Clientes", path: "/clientes" },
      { label: "Clientes con morosidad", path: "/clientes/morosidad" },
      { label: "Cobranza automática", path: "/clientes/cobranza" },
    ],
  },
  { label: "Pedidos", path: "/pedidos", icon: <ShoppingCartIcon /> },
  { label: "Recepción de mercancías", path: "/recepcion-mercancias", icon: <LocalShippingIcon /> },
  { label: "Pedidos (Sucursales)", path: "/pedidos/sucursales", icon: <StoreIcon /> },
  { label: "Solicitudes (Sucursales)", path: "/solicitudes/sucursales", icon: <AssignmentIcon /> },
  { label: "Solicitudes de descuentos", path: "/solicitudes-descuento", icon: <AttachMoneyIcon /> },
  {
    label: "Inventario",
    path: "/inventario",
    icon: <InventoryIcon />,
    subItems: [
      { label: "Inventario", path: "/inventario" },
      { label: "Mercancía dañada", path: "/inventario/mercancia-danada" },
      { label: "Liquidaciones", path: "/inventario/liquidaciones" },
    ],
  },
  { label: "Atención a cliente", path: "/atencion-cliente", icon: <SupportIcon /> },
  { label: "Rutas", path: "/rutas", icon: <RouteIcon /> },
  {
    label: "Catálogos",
    path: "/catalogos",
    icon: <FolderIcon />,
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
      <HeaderContainer>
        <LogoBox>
          <LogoText variant="caption">Foly</LogoText>
        </LogoBox>
        <BrandName variant="subtitle2">Folysoft</BrandName>
      </HeaderContainer>

      <NavigationContainer>
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
                        const subActive = router.pathname === subItem.path;
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
        <UserAvatar src="/avatar.png" alt="Usuario" />
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
