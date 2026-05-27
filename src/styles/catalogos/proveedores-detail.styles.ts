import { styled } from "@mui/material/styles";
import { Stack, Typography } from "@mui/material";

export const DashboardLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: theme.palette.primary.main,
}));

export const MetricCard = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  flexDirection: "column",
  gap: "12px",
  padding: "16px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "16px",
  height: "100%",
}));

export const MetricIconWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  borderRadius: "8px",
  backgroundColor: theme.palette.app.sidebar.itemSelected,
  color: theme.palette.primary.main,
  flexShrink: 0,
}));

export const MainPanel = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
  padding: theme.spacing(2.5),
  minHeight: 360,
}));

export const DeliveriesPanel = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
  padding: theme.spacing(2.5),
}));

export const DeliveryGroupHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1, 1.5),
  borderRadius: 8,
  backgroundColor: theme.palette.app.sidebar.itemSelected,
  marginBottom: theme.spacing(1),
}));

export const DeliveryItemRow = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.app.border}`,
  "&:last-child": {
    borderBottom: "none",
  },
}));

export const DeliveryProductIcon = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: 8,
  backgroundColor: theme.palette.app.background.sidebar,
  color: theme.palette.text.secondary,
  flexShrink: 0,
}));

export const TabEmptyState = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 200,
  color: theme.palette.text.secondary,
}));
