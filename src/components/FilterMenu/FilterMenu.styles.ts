import { styled } from "@mui/material/styles";

export const MenuContainer = styled('div')(({ theme }) => ({
  minWidth: "256px",
  maxWidth: "320px",
  backgroundColor: theme.palette.app.background.sidebar,
}));

export const MenuHeader = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px",
  borderBottom: `1px solid ${theme.palette.app.border}`,
}));

