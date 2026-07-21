import { styled } from "@mui/material/styles";
import { Box, Stack } from "@mui/material";
import type { Theme } from "@mui/material";

export const HeaderRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  marginBottom: theme.spacing(2),
}));

export const SideModalHeader = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2, 3),
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
}));

export const SideModalContent = styled(Stack)(({ theme }) => ({
  flex: 1,
  width: "100%",
  backgroundColor: theme.palette.background.content,
  padding: theme.spacing(2, 3),
  borderBottomLeftRadius: 24,
  borderBottomRightRadius: 24,
}));

export const PANEL_WIDTHS: Record<string, number> = {
  xs: 380,
  sm: 440,
  md: 560,
  lg: 720,
  xl: 960,
};

export function getDefaultPaperSx(
  theme: Theme,
  fullScreen: boolean,
  panelWidth: number,
  fullWidth: boolean,
) {
  if (fullScreen) return undefined;
  return {
    position: "fixed" as const,
    right: theme.spacing(2),
    top: theme.spacing(2),
    bottom: theme.spacing(2),
    margin: 0,
    height: "auto",
    maxHeight: "none",
    width: fullWidth ? panelWidth : "auto",
    minWidth: fullWidth ? panelWidth : 320,
    borderRadius: '24px',
    boxShadow:
      "-8px 0 32px rgba(0, 0, 0, 0.12), -4px 0 16px rgba(0, 0, 0, 0.08)",
  };
}
