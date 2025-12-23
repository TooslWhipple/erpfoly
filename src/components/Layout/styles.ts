import { styled } from "@mui/material/styles";
import { Box, IconButton } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { CONTENT_PADDING, colors } from "@/styles/theme";

export const LayoutContainer = styled(Box)({
  display: "flex",
  minHeight: "100vh",
});

export const MainContent = styled(Box)({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  width: "100%",
  overflow: "hidden",
});

export const ContentWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  padding: CONTENT_PADDING,
  backgroundColor: colors.background.main,
  position: "relative",
  overflow: "auto",
  [theme.breakpoints.down("md")]: {
    paddingTop: 72, // Espacio para el botón del menú
    padding: 16,
  },
  [theme.breakpoints.down("sm")]: {
    padding: 12,
    paddingTop: 64,
  },
}));

export const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  left: 16,
  top: 16,
  width: 40,
  height: 40,
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  zIndex: 10,
  "&:hover": {
    backgroundColor: colors.background.sidebar,
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
