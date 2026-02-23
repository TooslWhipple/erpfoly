import { styled } from "@mui/material/styles";
import {
  Box,
  Card,
  Typography,
  Chip,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { colors } from "@/styles/theme";

export const ClientCard = styled(Card)(({ theme }) => ({
  padding: 0,
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  overflow: "hidden",
}));

export const ClientCardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

export const ClientHeaderRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  flexWrap: "wrap",
  gap: theme.spacing(2),
}));

export const ClientId = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.secondary,
}));

export const ClientName = styled(Typography)(({ theme }) => ({
  fontSize: 22,
  fontWeight: 700,
  color: theme.palette.text.primary,
  lineHeight: 1.3,
}));

export const RequiredPaymentRow = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.secondary,
  "& strong": {
    color: theme.palette.text.primary,
  },
  "& .due-label": {
    color: theme.palette.error.main,
    fontWeight: 500,
  },
}));

export const CreditSummaryColumn = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: theme.spacing(0.5),
  minWidth: 180,
}));

/** Tabs section attached to the bottom of the card (no gap) */
export const TabsSection = styled(Box)(({ theme }) => ({
  marginTop: 0,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  borderTop: `1px solid ${colors.border}`,
  "& .MuiTabs-indicator": {
    backgroundColor: colors.sidebar.textSelected,
  },
  "& .Mui-selected": {
    color: `${colors.sidebar.textSelected} !important`,
  },
}));

// ============================================================================
// TAB CONTENT (below the card)
// ============================================================================

export const TabContentCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
}));

export const TabContentInner = styled(Box)(({ theme }) => ({
  minHeight: 200,
}));

// ============================================================================
// ACTIVITY TAB
// ============================================================================

export const ActivityFormCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${colors.border}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: colors.background.sidebar,
  marginBottom: theme.spacing(3),
}));

export const ActivityFormActions = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(2),
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 600,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1.5),
  textTransform: "uppercase",
  letterSpacing: "0.02em",
}));

export const ActivityList = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 12,
});

export const ActivityItemCard = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  border: `1px solid ${colors.border}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: colors.background.sidebar,
  alignItems: "flex-start",
}));

export const ActivityItemIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.chip.background,
  color: theme.palette.primary.main,
  flexShrink: 0,
}));

export const ActivityItemContent = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const ActivityItemMeta = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.secondary,
  marginBottom: 4,
}));

export const ActivityItemDescription = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.primary,
  lineHeight: 1.5,
}));

export const ActiveCasesList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(2),
}));

export const ActiveCaseCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${colors.border}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: colors.background.sidebar,
}));

export const CaseStatusChip = styled(Chip)(() => ({
  backgroundColor: "#16a34a",
  color: "#fff",
  fontWeight: 600,
  fontSize: 12,
  height: 24,
  marginBottom: 8,
  "& .MuiChip-label": {
    paddingLeft: 10,
    paddingRight: 10,
  },
}));

export const CaseId = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: 4,
}));

export const CaseDescription = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.secondary,
  marginBottom: 2,
}));

export const CaseOrderType = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.secondary,
}));

export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  border: `1px solid ${colors.border}`,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
}));

export const StyledTable = styled(Table)({
  minWidth: 640,
});

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: colors.chip.background,
  "& th": {
    fontSize: 12,
    fontWeight: 600,
    color: theme.palette.text.secondary,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${colors.border}`,
  },
}));

export const StyledTableBody = styled(TableBody)({});

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:last-child td": {
    borderBottom: "none",
  },
  "& td": {
    padding: theme.spacing(2),
    fontSize: 14,
    borderBottom: `1px solid ${colors.border}`,
  },
}));

export const TypeCellContent = styled(Box)<{ variant: "payment" | "purchase" }>(
  ({ theme, variant }) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    backgroundColor:
      variant === "payment" ? "rgba(34, 197, 94, 0.12)" : "rgba(37, 99, 235, 0.12)",
    color: variant === "payment" ? "#16a34a" : theme.palette.primary.main,
  })
);

export const InfoSectionHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const InfoSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: 20,
  fontWeight: 700,
  color: theme.palette.text.primary,
  marginBottom: 4,
}));

export const InfoSectionSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.secondary,
}));

export const InfoGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: theme.spacing(2),
}));

export const InfoCard = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(2.5),
  border: `1px solid ${colors.border}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: colors.background.sidebar,
  cursor: "pointer",
  transition: "border-color 0.2s, background-color 0.2s",
  "&:hover": {
    borderColor: theme.palette.primary.light,
    backgroundColor: "rgba(37, 99, 235, 0.04)",
  },
}));

export const InfoCardIcon = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export const InfoCardLabel = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.primary,
  textAlign: "center",
}));

export const EmptyState = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
  fontSize: 14,
}));

export const ErrorState = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(6),
  color: theme.palette.error.main,
  fontSize: 14,
  gap: theme.spacing(1),
}));
