import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  TableHead,
  TableRow,
  TableCell,
  IconButton,
  Alert,
} from "@mui/material";

export const PageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

export const PageHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  flexWrap: "wrap",
}));

export const HeaderActions = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  flexShrink: 0,
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
}));

export const HeaderSection = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: theme.spacing(3),
  flexWrap: "wrap",
}));

export const TransferInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  flex: 1,
  minWidth: 0,
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

export const SupplierInfo = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  flex: 1,
  minWidth: 160,
});

export const SupplierName = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 500,
  color: theme.palette.text.primary,
}));

export const SupplierDate = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
}));

export const BranchInfo = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  flex: 1,
  minWidth: 160,
});

export const BranchName = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 500,
  color: theme.palette.text.primary,
}));

export const DeliveryDate = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
}));

export const ProgressSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(-1),
}));

export const ProgressBarContainer = styled(Box)({
  width: "100%",
});

export const StyledProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.app.border,
  "& .MuiLinearProgress-bar": {
    borderRadius: 4,
    backgroundColor: theme.palette.success.main,
  },
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 200,
  textTransform: "none",
  fontWeight: 500,
  height: 40,
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

export const ContentLayout = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  alignItems: "flex-start",
  [theme.breakpoints.down("lg")]: {
    flexDirection: "column",
  },
}));

export const MainContent = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const SidePanel = styled(Box)(({ theme }) => ({
  width: 320,
  flexShrink: 0,
  [theme.breakpoints.down("lg")]: {
    width: "100%",
  },
}));

export const ContentSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 12,
  padding: theme.spacing(3),
}));

export const SectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
}));

export const SectionDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
}));

export const TableContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  overflowX: "auto",
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
}));

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.background.default,
  },
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.app.border}`,
  fontSize: "0.875rem",
  color: theme.palette.text.primary,
}));

export const ArticleNameCell = styled(StyledTableCell)({
  fontWeight: 400,
});

export const InvoicesPanel = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 12,
  padding: theme.spacing(2.5),
  minHeight: 280,
}));

export const InvoicesPanelHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
});

export const AddInvoiceButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  width: 36,
  height: 36,
  color: theme.palette.text.secondary,
}));

export const InvoicesEmptyState = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: theme.spacing(3),
  borderRadius: 8,
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
  lineHeight: 1.5,
  flex: 1,
}));

export const InvoiceCard = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 10,
}));

export const InvoiceCardInfo = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  flex: 1,
  minWidth: 0,
});

export const InvoiceCardId = styled(Typography)(({ theme }) => ({
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const InvoiceCardDate = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
}));

export const InvoiceCardAmount = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 700,
  color: theme.palette.text.primary,
  whiteSpace: "nowrap",
}));

export const RemoveInvoiceButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: 4,
}));

export const InvoicesTotalRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.app.border}`,
}));

export const InvoicesTotalLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const InvoicesTotalValue = styled(Typography)(({ theme }) => ({
  fontSize: "0.9375rem",
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

export const InvoiceAmountAlert = styled(Alert)(({ theme }) => ({
  borderRadius: 8,
  backgroundColor: theme.palette.app.chip.variants.pending.background,
  color: theme.palette.app.chip.variants.pending.color,
  "& .MuiAlert-icon": {
    color: theme.palette.app.chip.variants.pending.color,
  },
}));
