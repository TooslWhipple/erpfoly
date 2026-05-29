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

export const ActivityStateMessage = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(4, 2),
  minHeight: 160,
}));
