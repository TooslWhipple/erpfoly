import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

export const ActivityModalHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  width: "100%",
}));

export const ActivityModalTitleRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export const ActivitySectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: 16,
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1.5),
}));

export const ActivityTableWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 12,
  border: `1px solid ${theme.palette.app.border}`,
  overflow: "hidden",
}));

export const ActivityStatusBadge = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 10px",
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 500,
  backgroundColor: theme.palette.app.chip.variants.success.background,
  color: theme.palette.app.chip.variants.success.color,
}));
