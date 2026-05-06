import { styled } from "@mui/material/styles";
import { Avatar, Box, Drawer, ListItemButton, ListItemIcon, Typography } from "@mui/material";
import { ChevronDown, ChevronUp } from "@/components/Icons";
import { SIDEBAR_WIDTH, theme } from "@/styles/theme";
interface StyledDrawerProps {
  isMobile?: boolean;
}

export const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "isMobile",
})<StyledDrawerProps>(({ isMobile }) => ({
  width: isMobile ? 0 : SIDEBAR_WIDTH,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: SIDEBAR_WIDTH,
    boxSizing: "border-box",
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.app.border}`,
  },
}));

export const NavigationContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  padding: "16px 8px 0px",
  gap: "24px",
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

export const UserProfileContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderTop: `1px solid ${theme.palette.app.border}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export const UserAvatar = styled(Avatar)({
  width: 32,
  height: 32,
  flexShrink: 0,
});

export const UserInfoContainer = styled(Box)({
  overflow: "hidden",
});

export const UserEmail = styled(Typography)({
  display: "block",
});

