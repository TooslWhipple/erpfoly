import { styled } from "@mui/material/styles";
import { Box, IconButton } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { NAV_COMPACT_BREAKPOINT } from "@/lib/layoutBreakpoints";
import { CONTENT_PADDING } from "@/styles/theme";

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

export const ContentWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== "embedNavMenu" && prop !== "flushPadding",
})<{ embedNavMenu?: boolean; flushPadding?: boolean }>(
  ({ theme, embedNavMenu, flushPadding }) => ({
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    // Sales flow (nueva / detalle) manages its own page chrome — no global inset.
    padding: flushPadding ? 0 : CONTENT_PADDING,
    backgroundColor: theme.palette.background.default,
    position: "relative",
    overflowY: "auto",
    overflowX: "hidden",
    // Mobile: reserve space for the floating menu unless the page embeds the
    // toggle inline (sales flow chrome).
    // `paddingTop` must come AFTER shorthand `padding` or it gets overwritten.
    ...(!flushPadding
      ? {
          [theme.breakpoints.down(NAV_COMPACT_BREAKPOINT)]: {
            padding: 16,
            paddingTop: embedNavMenu ? 16 : 72,
          },
          [theme.breakpoints.down("sm")]: {
            padding: 12,
            paddingTop: embedNavMenu ? 12 : 64,
          },
        }
      : {}),
  }),
);

export const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  left: 16,
  top: 16,
  width: 40,
  height: 40,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  zIndex: theme.zIndex.appBar,
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

export const MobileMenuIcon = styled(MenuIcon)(({ theme }) => ({
  width: 20,
  height: 20,
  color: theme.palette.text.primary,
}));

export const NotificationsButtonContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "flushPadding",
})<{ flushPadding?: boolean }>(({ theme, flushPadding }) => ({
  position: "absolute",
  right: flushPadding ? 16 : CONTENT_PADDING,
  top: flushPadding ? 16 : CONTENT_PADDING,
  zIndex: theme.zIndex.appBar,
  [theme.breakpoints.down(NAV_COMPACT_BREAKPOINT)]: {
    right: 16,
    top: 16,
  },
  [theme.breakpoints.down("sm")]: {
    right: 12,
    top: 12,
  },
}));
