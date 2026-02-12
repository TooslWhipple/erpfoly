import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, Button } from "@mui/material";
import { colors } from "@/styles/theme";

export const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const PageTitle = styled(Typography)({
  fontSize: "1.75rem",
  fontWeight: 700,
  color: "#232325",
});

export const PageDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));

// ============================================================================
// CARDS
// ============================================================================

export const Card = styled(Paper)(({ theme }) => ({
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: theme.spacing(3),
  boxShadow: "none",
  marginBottom: theme.spacing(3),
  "&:last-of-type": {
    marginBottom: 0,
  },
}));

export const CardTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 600,
  color: "#232325",
  marginBottom: theme.spacing(2),
}));

// ============================================================================
// SALES HISTORY CARD (CHART)
// ============================================================================

export const ChartHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));

export const ChartFilterButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  height: 36,
}));

export const ChartWrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  height: 320,
  [theme.breakpoints.down("sm")]: {
    height: 280,
  },
}));

// ============================================================================
// MONTH NAVIGATOR CARD
// ============================================================================

export const MonthNavigatorRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const MonthNavigatorCenter = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

export const MonthLabel = styled(Typography)({
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#232325",
  minWidth: 140,
  textAlign: "center",
});

export const TotalGoalAmount = styled(Typography)({
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#232325",
});

export const NavigatorDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
}));

// ============================================================================
// TABLE CARD
// ============================================================================

export const TableCardTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 600,
  color: "#232325",
  marginBottom: theme.spacing(2),
}));
