import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export const OrderCard = styled('div')({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "16px",
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
  padding: "16px"
});

export const OrderHeader = styled('div')({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  borderBottom: `1px solid ${theme.palette.app.border}`,
  [theme.breakpoints.down('sm')]: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
});

export const OrderItemRow = styled('div')({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  padding: "8px 0px 8px 36px",
  borderBottom: `1px solid ${theme.palette.app.border}`,
  "&:last-child": {
    borderBottom: "none",
  },
  [theme.breakpoints.down('sm')]: {
    padding: "8px 0px",
  },
});

export const EmptyState = styled('div')(({ theme: muiTheme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: muiTheme.spacing(6),
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
}));
