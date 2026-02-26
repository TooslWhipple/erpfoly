import { styled } from "@mui/material/styles";
import { Box, Select, TextField, Typography } from "@mui/material";
import { colors } from "@/styles/theme";

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
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.background.sidebar,
  marginBottom: theme.spacing(2),
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
})) as typeof Select;

export const RuleValueInput = styled(TextField)(({ theme }) => ({
  width: 72,
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1.5),
    fontSize: 14,
    textAlign: "center",
  },
}));

export const RulePeriodSelect = styled(Select)(({ theme }) => ({
  minWidth: 110,
  fontSize: 14,
  "& .MuiSelect-select": {
    padding: theme.spacing(1, 2),
  },
})) as typeof Select;

export const RulePromotionInput = styled(TextField)(({ theme }) => ({
  width: 80,
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1.5),
    fontSize: 14,
  },
}));

export const RuleActions = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  marginLeft: "auto",
  flexShrink: 0,
}));
