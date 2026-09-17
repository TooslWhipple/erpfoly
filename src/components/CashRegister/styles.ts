import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";

function cashInDrawerWidgetFrameStyles(theme: Theme, collapsed?: boolean) {
  return {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: collapsed ? "center" : "stretch",
    justifyContent: "center",
    gap: theme.spacing(collapsed ? 0.5 : 0.75),
    width: "100%",
    margin: 0,
    padding: collapsed ? theme.spacing(0.75) : theme.spacing(1.25),
    border: collapsed ? "none" : `1px solid ${theme.palette.app.border}`,
    borderRadius: 8,
    backgroundColor: "transparent",
    textAlign: "left" as const,
    whiteSpace: "normal" as const,
    color: "inherit",
    font: "inherit",
    minWidth: 0,
    boxSizing: "border-box" as const,
  };
}

export const CashInDrawerWidgetButton = styled("button", {
  shouldForwardProp: (prop) => prop !== "collapsed",
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
  ...cashInDrawerWidgetFrameStyles(theme, collapsed),
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

export const CashInDrawerWidgetSkeletonFrame = styled(Box, {
  shouldForwardProp: (prop) => prop !== "collapsed",
})<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
  ...cashInDrawerWidgetFrameStyles(theme, collapsed),
  pointerEvents: "none",
}));
