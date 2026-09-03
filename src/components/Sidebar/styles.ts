import { styled } from "@mui/material/styles";
import { Avatar, Drawer, ListItemButton, ListItemIcon, Typography } from "@mui/material";
import { ChevronDown, ChevronUp } from "@/components/Icons";
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH, theme } from "@/styles/theme";

interface StyledDrawerProps {
  isMobile?: boolean;
  collapsed?: boolean;
}

export const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "isMobile" && prop !== "collapsed",
})<StyledDrawerProps>(({ theme, isMobile, collapsed }) => {
  const desktopWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return {
    width: isMobile ? 0 : desktopWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    "& .MuiDrawer-paper": {
      width: desktopWidth,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      height: isMobile ? "100vh" : `calc(100vh - 32px)`,
      marginTop: isMobile ? 0 : "16px",
      marginLeft: isMobile ? 0 : "16px",
      padding: theme.spacing(1.5),
      overflowX: "hidden",
      overflowY: "visible",
      backgroundColor: theme.palette.background.paper,
      borderRadius: isMobile ? 0 : "8px",
      border: isMobile ? "none" : `1px solid ${theme.palette.app.border}`,
    },
  };
});

export const SidebarHeader = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  flexShrink: 0,
  overflow: "visible",
}));

export const NavigationContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
  overflowY: "auto",
  overflowX: "hidden",
}));

interface NavItemButtonProps {
  active?: boolean;
  hasSubItems?: boolean;
  collapsed?: boolean;
}

export const NavItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) =>
    prop !== "active" && prop !== "hasSubItems" && prop !== "collapsed",
})<NavItemButtonProps>(({ active, hasSubItems, collapsed }) => ({
  backgroundColor: active && !hasSubItems ? theme.palette.app.sidebar.itemSelected : "transparent",
  color: active ? theme.palette.app.sidebar.textSelected : "inherit",
  padding: collapsed ? "8px" : "8px 12px",
  justifyContent: collapsed ? "center" : "flex-start",
  minHeight: 36,
  borderRadius: 8,
  "&:hover": {
    backgroundColor: active && !hasSubItems ? theme.palette.app.sidebar.itemSelected : "rgba(0, 0, 0, 0.04)",
  },
}));

interface NavItemIconProps {
  active?: boolean;
  collapsed?: boolean;
}

export const NavItemIcon = styled(ListItemIcon, {
  shouldForwardProp: (prop) => prop !== "active" && prop !== "collapsed",
})<NavItemIconProps>(({ active, collapsed }) => ({
  minWidth: collapsed ? 0 : 24,
  marginRight: collapsed ? 0 : 8,
  color: active ? theme.palette.app.sidebar.textSelected : "inherit",
  justifyContent: "center",
  "& svg": {
    width: 16,
    height: 16,
    flexShrink: 0,
  },
}));

interface SubItemButtonProps {
  active?: boolean;
}

export const SubItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "active",
})<SubItemButtonProps>(({ active }) => ({
  paddingLeft: 44,
  backgroundColor: active ? theme.palette.app.sidebar.itemSelected : "transparent",
  color: active ? theme.palette.app.sidebar.textSelected : "inherit",
  borderRadius: 8,
  "&:hover": {
    backgroundColor: active ? theme.palette.app.sidebar.itemSelected : "rgba(0, 0, 0, 0.04)",
  },
}));

export const ExpandIcon = styled(ChevronDown)({
  width: 16,
  height: 16,
  flexShrink: 0,
});

export const CollapseIcon = styled(ChevronUp)({
  width: 16,
  height: 16,
  flexShrink: 0,
});

export const UserProfileContainer = styled("div", {
  shouldForwardProp: (prop) => prop !== "collapsed",
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: collapsed ? "center" : "flex-start",
  flexDirection: collapsed ? "column" : "row",
  gap: theme.spacing(0.75),
  flexShrink: 0,
  marginTop: theme.spacing(1),
  paddingTop: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.app.border}`,
}));

export const UserAvatar = styled(Avatar)({
  width: 32,
  height: 32,
  flexShrink: 0,
});

export const UserInfoContainer = styled('div')({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
});

export const UserRole = styled(Typography)({
  display: "block",
});
