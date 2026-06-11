import { styled, Theme } from "@mui/material/styles";
import { Box, Paper, Select, Chip, IconButton } from "@mui/material";

export const RuleCardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 8,
  border: `1px solid ${theme.palette.app.border}`,
  boxShadow: "none",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  minWidth: 0,
  "&:last-child": {
    marginBottom: 0,
  },
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    alignItems: "stretch",
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  },
}));

export const RuleContent = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  flex: 1,
  minWidth: 0,
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: theme.spacing(1.5),
  },
}));

export const RuleFieldGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  minWidth: 0,
  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
}));

export const RuleLabel = styled("span")(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.primary,
  whiteSpace: "nowrap",
  flexShrink: 0,
}));

const baseSelectStyles = (theme: Theme) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 6,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.app.border,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.app.border,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.app.sidebar.textSelected,
  },
  "& .MuiSelect-select": {
    padding: "8px 12px",
    fontSize: 14,
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
});

const responsiveSelectStyles = (theme: Theme, desktopWidth: number | string) => ({
  ...baseSelectStyles(theme),
  width: desktopWidth,
  minWidth: 0,
  [theme.breakpoints.down("md")]: {
    flex: 1,
    width: "100%",
  },
});

// Trigger select: "Fecha límite de pago" / "Morosidad"
export const TriggerSelect = styled(Select)(({ theme }) => ({
  ...responsiveSelectStyles(theme, 180),
}));

// Operator select: "Menor" / "Mayor" / "Igual"
export const OperatorSelect = styled(Select)(({ theme }) => ({
  ...responsiveSelectStyles(theme, 100),
}));

// Period select: "1 día" / "7 días" / "1 mes"
export const PeriodSelect = styled(Select)(({ theme }) => ({
  ...responsiveSelectStyles(theme, 100),
}));

// Message select: "Mensaje recordatorio de pago"
export const MessageSelect = styled(Select)(({ theme }) => ({
  ...responsiveSelectStyles(theme, 290),
  [theme.breakpoints.down("md")]: {
    flex: 1,
    width: "100%",
    maxWidth: "100%",
  },
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
})<StatusChipProps>(({ theme, status }) => ({
  borderRadius: 6,
  fontWeight: 500,
  fontSize: 13,
  height: 28,
  width: 70,
  flexShrink: 0,
  backgroundColor:
    status === "active"
      ? theme.palette.app.chip.variants.success.background
      : theme.palette.app.chip.variants.default.background,
  color:
    status === "active"
      ? theme.palette.app.chip.variants.success.color
      : theme.palette.app.chip.variants.default.color,
  "& .MuiChip-label": {
    padding: "0 10px",
  },
}));

export const RuleCardFooter = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexShrink: 0,
  marginLeft: "auto",
  [theme.breakpoints.down("md")]: {
    marginLeft: 0,
    width: "100%",
    justifyContent: "space-between",
    paddingTop: theme.spacing(0.5),
    borderTop: `1px solid ${theme.palette.app.border}`,
  },
}));

export const ActionsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

export const ActionIconButton = styled(IconButton)(({ theme }) => ({
  padding: 6,
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

export const RulesListContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 0,
  width: "100%",
  minWidth: 0,
}));

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  border: `1px dashed ${theme.palette.app.border}`,
}));
