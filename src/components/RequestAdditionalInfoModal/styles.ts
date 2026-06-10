import { styled } from "@mui/material/styles";
import { Stack } from "@mui/material";

export const Card = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "24px",
  padding: "16px",
  borderRadius: "16px",
  border: `1px solid ${(selected) ? theme.palette.app.sidebar.itemSelected : theme.palette.divider}`,
  backgroundColor: (selected) ? theme.palette.app.sidebar.itemSelected : 'transparent',
  transition: 'border-color 0.2s, background-color 0.2s',
  [theme.breakpoints.down('sm')]: {
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    gap: "16px",
  },
}));

export const IconCircle = styled('div', {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  minWidth: "42px",
  minHeight: "42px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: (selected) ? theme.palette.primary.main : "#E2E8F0",
  color: (selected) ? "#ffffff" : theme.palette.text.secondary,
  transition: 'background-color 0.2s'
}));

export const FooterActions = styled('div')(({ theme }) => ({
  marginTop: "auto",
  paddingTop: theme.spacing(2),
  width: "100%",
}));
