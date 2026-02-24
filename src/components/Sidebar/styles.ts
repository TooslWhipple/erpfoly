import { styled } from "@mui/material/styles";
import { Avatar, Box, Drawer, ListItemButton, ListItemIcon, Typography } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { SIDEBAR_WIDTH, colors } from "@/styles/theme";

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
    backgroundColor: colors.background.sidebar,
    borderRight: `1px solid ${colors.border}`,
  },
}));

export const NavigationContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2, 1.5),
  overflowY: "auto",
}));

interface NavItemButtonProps {
  active?: boolean;
  hasSubItems?: boolean;
}

export const NavItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "active" && prop !== "hasSubItems",
})<NavItemButtonProps>(({ active, hasSubItems }) => ({
  backgroundColor: active && !hasSubItems ? colors.sidebar.itemSelected : "transparent",
  color: active ? colors.sidebar.textSelected : "inherit",
  padding: "8px 12px",
  "&:hover": {
    backgroundColor: active && !hasSubItems ? colors.sidebar.itemSelected : "rgba(0, 0, 0, 0.04)",
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
  color: active ? colors.sidebar.textSelected : "inherit",
  "& .MuiSvgIcon-root": {
    width: 16,
    height: 16,
  },
}));

interface SubItemButtonProps {
  active?: boolean;
}

export const SubItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "active",
})<SubItemButtonProps>(({ active }) => ({
  paddingLeft: 44,
  backgroundColor: active ? colors.sidebar.itemSelected : "transparent",
  color: active ? colors.sidebar.textSelected : "inherit",
  "&:hover": {
    backgroundColor: active ? colors.sidebar.itemSelected : "rgba(0, 0, 0, 0.04)",
  },
}));

export const ExpandIcon = styled(ExpandMore)({
  width: 16,
  height: 16,
});

export const CollapseIcon = styled(ExpandLess)({
  width: 16,
  height: 16,
});

export const UserProfileContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderTop: `1px solid ${colors.border}`,
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

