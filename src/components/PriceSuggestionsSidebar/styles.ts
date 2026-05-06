import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { theme } from "@/styles/theme";

// ============================================================================
// CONTAINER
// ============================================================================

export const SidebarContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  padding: theme.spacing(2.5),
  width: "100%",
  maxWidth: 400,
  position: "sticky",
  top: theme.spacing(2),
  alignSelf: "flex-start",
  [theme.breakpoints.down("lg")]: {
    maxWidth: "100%",
    position: "relative",
    top: 0,
  },
}));

// ============================================================================
// HEADER
// ============================================================================

export const SidebarHeader = styled(Box)({
  marginBottom: 8,
});

export const SidebarIcon = styled(Box)({
  width: 32,
  height: 32,
  borderRadius: 6,
  backgroundColor: "#FEF3C7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const SidebarTitle = styled(Typography)(({ theme }) => ({
  fontSize: 18,
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const SidebarSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  lineHeight: 1.5,
}));

// ============================================================================
// LIST
// ============================================================================

export const SuggestionsList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));
