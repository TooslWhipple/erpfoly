import { styled } from "@mui/material/styles";
import { Box, IconButton, Typography } from "@mui/material";

export const Container = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 4,
});

export const BackButton = styled(IconButton)(({ theme }) => ({
  width: 36,
  height: 36,
  marginRight: theme.spacing(1),
  padding: 0,
  backgroundColor: theme.palette.app.background.sidebar,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.text.primary,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: theme.palette.app.background.sidebar,
    borderColor: theme.palette.app.border,
    boxShadow: "none",
    opacity: 0.9,
  },
  "& .MuiSvgIcon-root": {
    fontSize: 20,
  },
}));

export const BreadcrumbLink = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  cursor: "pointer",
  transition: "color 0.15s ease",
  "&:hover": {
    color: theme.palette.text.primary,
  },
}));

export const BreadcrumbCurrent = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.primary,
  fontWeight: 500,
}));

export const Separator = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.disabled,
  margin: "0 8px",
  userSelect: "none",
}));
