import { styled } from "@mui/material/styles";
import { Avatar, Drawer, ListItemButton, ListItemIcon, Typography } from "@mui/material";
import { ChevronDown, ChevronUp } from "@/components/Icons";
import { SIDEBAR_WIDTH, theme } from "@/styles/theme";
interface StyledDrawerProps {
  isMobile?: boolean;
}

export const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "isMobile",
})<StyledDrawerProps>(({ theme, isMobile }) => ({
  width: (isMobile) ? 0 : SIDEBAR_WIDTH,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: SIDEBAR_WIDTH,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    height: (isMobile) ? "100vh" : `calc(100vh - 48px)`,
    marginTop: (isMobile) ? 0 : "16px",
    marginLeft: (isMobile) ? 0 : "16px",
    padding: theme.spacing(1),
    overflow: "visible",
    backgroundColor: (isMobile) ? theme.palette.background.paper : "transparent",
    borderRadius: (isMobile) ? 0 : "8px",
    border: (isMobile) ? "none" : `1px solid ${theme.palette.app.border}`,
  },
}));

export const SidebarHeader = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  flexShrink: 0,
  overflow: "visible",
}));

export const NavigationContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
  gap: theme.spacing(2),
  overflowY: "auto",
}));

interface NavItemButtonProps {
  active?: boolean;
  hasSubItems?: boolean;
}

export const NavItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "active" && prop !== "hasSubItems",
})<NavItemButtonProps>(({ active, hasSubItems }) => ({
  backgroundColor: active && !hasSubItems ? theme.palette.app.sidebar.itemSelected : "transparent",
  color: active ? theme.palette.app.sidebar.textSelected : "inherit",
  padding: "8px 12px",
  "&:hover": {
    backgroundColor: active && !hasSubItems ? theme.palette.app.sidebar.itemSelected : "rgba(0, 0, 0, 0.04)",
  },
}));

interface NavItemIconProps {
  active?: boolean;
}

export const NavItemIcon = styled(ListItemIcon, {
  shouldForwardProp: (prop) => prop !== "active",
})<NavItemIconProps>(({ active }) => ({
  minWidth: 24,
  marginRight: 8,
  color: active ? theme.palette.app.sidebar.textSelected : "inherit",
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

export const UserProfileContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexShrink: 0,
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

