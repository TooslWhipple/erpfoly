import { styled } from "@mui/material/styles";
import { Box, Select, TextField, Typography } from "@mui/material";

// ============================================================================
// CARD
// ============================================================================

export const RuleCardContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(2),
  minWidth: 0,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

export const RuleNumberBadge = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontSize: 14,
  fontWeight: 700,
  flexShrink: 0,
}));

export const RuleLabel = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.secondary,
  flexShrink: 0,
}));

export const RuleOperatorSelect = styled(Select)(({ theme }) => ({
  minWidth: 120,
  fontSize: 14,
  "& .MuiSelect-select": {
    padding: theme.spacing(1, 2),
  },
  [theme.breakpoints.down("sm")]: {
    minWidth: 0,
    width: "100%",
  },
}));

export const RuleValueInput = styled(TextField)(({ theme }) => ({
  width: 72,
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1.5),
    fontSize: 14,
    textAlign: "center",
  },
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

export const RulePeriodSelect = styled(Select)(({ theme }) => ({
  minWidth: 110,
  fontSize: 14,
  "& .MuiSelect-select": {
    padding: theme.spacing(1, 2),
  },
  [theme.breakpoints.down("sm")]: {
    minWidth: 0,
    width: "100%",
  },
}));

export const RulePromotionInput = styled(TextField)(({ theme }) => ({
  width: 80,
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1.5),
    fontSize: 14,
  },
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

export const RuleActions = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  marginLeft: "auto",
  flexShrink: 0,
  [theme.breakpoints.down("sm")]: {
    marginLeft: 0,
    justifyContent: "flex-end",
    width: "100%",
  },
}));
