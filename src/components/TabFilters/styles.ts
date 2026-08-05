import { styled } from "@mui/material/styles";
import { Box, Tab, Tabs } from "@mui/material";

export const TabsWrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "contained" && prop !== "fullWidth",
})<{ contained?: boolean; fullWidth?: boolean }>(
  ({ theme, contained, fullWidth }) => ({
    position: "relative",
    display: "inline-flex",
    justifyContent: "flex-start",
    alignItems: "center",
    height: 36,
    width: contained || fullWidth ? "100%" : "max-content",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    backgroundColor: theme.palette.app.segmentControl.background,
    borderRadius: 10,
    padding: "0 4px",
    // Single scroll owner lives on MUI Tabs scroller; wrapper only clips.
    overflow: "hidden",
    verticalAlign: "middle",
  }),
);

export const TabsFadeEdge = styled(Box, {
  shouldForwardProp: (prop) => prop !== "side",
})<{ side: "left" | "right" }>(({ theme, side }) => {
  const bg = theme.palette.app.segmentControl.background;
  return {
    position: "absolute",
    top: 0,
    bottom: 0,
    [side]: 0,
    width: 36,
    zIndex: 2,
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: side === "left" ? "flex-start" : "flex-end",
    paddingInline: 2,
    borderRadius: side === "left" ? "10px 0 0 10px" : "0 10px 10px 0",
    background:
      side === "left"
        ? `linear-gradient(to right, ${bg} 40%, transparent)`
        : `linear-gradient(to left, ${bg} 40%, transparent)`,
    color: theme.palette.text.disabled,
    opacity: 0.85,
  };
});

export const StyledTabs = styled(Tabs, {
  shouldForwardProp: (prop) => prop !== "fullWidth",
})<{ fullWidth?: boolean }>(({ fullWidth }) => ({
  minHeight: 28,
  height: 28,
  width: fullWidth ? "100%" : "max-content",
  maxWidth: "100%",
  minWidth: 0,
  overflow: "hidden",
  boxSizing: "border-box",
  "& .MuiTabs-indicator": {
    display: "none",
  },
  "& .MuiTabs-flexContainer": {
    gap: fullWidth ? 2 : 0,
    height: 28,
    alignItems: "center",
    width: fullWidth ? "100%" : "max-content",
    flexWrap: "nowrap",
  },
  "& .MuiTabs-scroller": {
    overflowX: fullWidth ? "hidden !important" : "auto !important",
    overflowY: "hidden",
    maxWidth: "100%",
    minWidth: 0,
    WebkitOverflowScrolling: "touch",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    scrollbarWidth: "none",
  },
}));

export const StyledTab = styled(Tab, {
  shouldForwardProp: (prop) => prop !== "dense" && prop !== "equalWidth",
})<{ dense?: boolean; equalWidth?: boolean }>(({ theme, dense, equalWidth }) => ({
  minHeight: 28,
  height: 28,
  padding: dense || equalWidth ? "0 8px" : "0 16px",
  textTransform: "none",
  fontSize: dense || equalWidth ? 12 : 14,
  lineHeight: "20px",
  fontWeight: 400,
  color: theme.palette.app.segmentControl.textInactive,
  whiteSpace: "nowrap",
  minWidth: equalWidth ? 0 : "auto",
  flex: equalWidth ? "1 1 0" : "0 0 auto",
  flexShrink: 0,
  maxWidth: equalWidth ? "100%" : "none",
  overflow: equalWidth ? "hidden" : "visible",
  textOverflow: equalWidth ? "ellipsis" : "clip",
  borderRadius: 8,
  transition:
    "background-color 0.2s ease, color 0.2s ease, font-weight 0.2s ease, box-shadow 0.2s ease",
  "&.Mui-selected": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontWeight: 600,
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: dense || equalWidth ? "0 6px" : "0 12px",
    fontSize: dense || equalWidth ? 11 : 13,
  },
  ...(!dense &&
    !equalWidth && {
      [theme.breakpoints.down("md")]: {
        flex: "0 0 auto",
        minWidth: "auto",
        maxWidth: "none",
      },
    }),
}));
