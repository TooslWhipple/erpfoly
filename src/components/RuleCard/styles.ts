import { styled } from "@mui/material/styles";
import { Box, Paper, Select, Chip, IconButton } from "@mui/material";
import { colors } from "@/styles/theme";

export const RuleCardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  boxShadow: "none",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.background.sidebar,
  "&:last-child": {
    marginBottom: 0,
  },
}));

export const RuleContent = styled(Box)({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
  flex: 1,
});

export const RuleLabel = styled("span")(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.primary,
  whiteSpace: "nowrap",
}));

const baseSelectStyles = (theme: ReturnType<typeof import("@mui/material/styles").useTheme>) => ({
  backgroundColor: colors.background.sidebar,
  borderRadius: 6,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: colors.border,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: colors.border,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: colors.sidebar.textSelected,
  },
  "& .MuiSelect-select": {
    padding: "8px 12px",
    fontSize: 14,
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
});

// Trigger select: "Fecha límite de pago" / "Morosidad"
export const TriggerSelect = styled(Select)(({ theme }) => ({
  ...baseSelectStyles(theme),
  width: 180,
}));

// Operator select: "Menor" / "Mayor" / "Igual"
export const OperatorSelect = styled(Select)(({ theme }) => ({
  ...baseSelectStyles(theme),
  width: 100,
}));

// Period select: "1 día" / "7 días" / "1 mes"
export const PeriodSelect = styled(Select)(({ theme }) => ({
  ...baseSelectStyles(theme),
  width: 100,
}));

// Message select: "Mensaje recordatorio de pago"
export const MessageSelect = styled(Select)(({ theme }) => ({
  ...baseSelectStyles(theme),
  width: 290,
}));

// Generic styled select (kept for backwards compatibility)
export const StyledRuleSelect = styled(Select)(({ theme }) => ({
  ...baseSelectStyles(theme),
  minWidth: 120,
}));

export const LargeRuleSelect = styled(StyledRuleSelect)({
  minWidth: 220,
});

interface StatusChipProps {
  status: "active" | "inactive";
}

export const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "status",
})<StatusChipProps>(({ status }) => ({
  borderRadius: 6,
  fontWeight: 500,
  fontSize: 13,
  height: 28,
  width: 70,
  backgroundColor: status === "active" ? "#DCFCE7" : "#F4F4F5",
  color: status === "active" ? "#16A34A" : "#71717A",
  "& .MuiChip-label": {
    padding: "0 10px",
  },
}));

export const ActionsContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginLeft: "auto",
});

export const ActionIconButton = styled(IconButton)(({ theme }) => ({
  padding: 6,
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

export const DragHandle = styled(Box)(({ theme }) => ({
  cursor: "grab",
  display: "flex",
  alignItems: "center",
  color: theme.palette.text.secondary,
  "&:active": {
    cursor: "grabbing",
  },
}));

export const RulesListContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 0,
}));

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  backgroundColor: colors.background.sidebar,
  borderRadius: 8,
  border: `1px dashed ${colors.border}`,
}));
