import { styled } from "@mui/material/styles";
import { Box, Paper, Typography } from "@mui/material";

export const SettingsGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "1fr",
  },
}));

export const SettingsCard = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 10,
  padding: theme.spacing(2.5),
  boxShadow: "none",
}));

export const SettingsTitle = styled(Typography)(() => ({
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#232325",
}));

export const SettingsDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  marginBottom: theme.spacing(1.5),
}));

export const SettingsValue = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  backgroundColor: theme.palette.background.default,
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  paddingInline: theme.spacing(1.5),
  fontSize: "1rem",
  color: theme.palette.text.primary,
  width: "100%",
  maxWidth: 180,
}));

export const PromotionsCard = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 10,
  padding: theme.spacing(2),
  boxShadow: "none",
}));

export const PromotionsHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
}));
