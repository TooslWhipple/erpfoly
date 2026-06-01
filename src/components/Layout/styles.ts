import { styled } from "@mui/material/styles";
import { Box, IconButton } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { CONTENT_PADDING, theme } from "@/styles/theme";

export const LayoutContainer = styled(Box)({
  display: "flex",
  minHeight: "100vh",
});

export const MainContent = styled(Box)({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  minHeight: 0,
  width: "100%",
  overflow: "hidden",
}) as unknown as typeof Box;

export const ContentWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  padding: CONTENT_PADDING,
  backgroundColor: theme.palette.background.default,
  position: "relative",
  overflowY: "auto",
  overflowX: "hidden",
  [theme.breakpoints.down("md")]: {
    paddingTop: 72, // Espacio para el botón del menú
    padding: 16,
  },
  [theme.breakpoints.down("sm")]: {
    padding: 12,
    paddingTop: 64,
  },
}));

export const TopBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: "12px 24px",
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.app.border}`,
  minHeight: 56,
  [theme.breakpoints.down("md")]: {
    padding: "12px 16px",
    paddingTop: 72,
  },
  [theme.breakpoints.down("sm")]: {
    padding: "12px 12px",
    paddingTop: 64,
  },
}));

export const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  left: 16,
  top: 16,
  width: 40,
  height: 40,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  zIndex: 10,
  "&:hover": {
    backgroundColor: theme.palette.background.paper,
  },
  [theme.breakpoints.down("sm")]: {
    left: 12,
    top: 12,
    width: 36,
    height: 36,
  },
}));

export const MobileMenuIcon = styled(MenuIcon)({
  width: 20,
  height: 20,
  color: "#232325",
});
