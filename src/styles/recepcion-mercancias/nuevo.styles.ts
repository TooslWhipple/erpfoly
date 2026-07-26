import { styled } from "@mui/material/styles";
import {
  Typography,
  Button,
  LinearProgress,
  TableHead,
  TableRow,
  TableCell,
  IconButton,
  Alert,
  Table as MuiTable,
} from "@mui/material";

export const PageContainer = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

export const PageHeader = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  flexWrap: "wrap",
}));

export const HeaderActions = styled('div')(({ theme }) => ({
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

export const HeaderSection = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: theme.spacing(3),
  flexWrap: "wrap",
}));

export const TransferInfo = styled('div')(({ theme }) => ({
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

export const SupplierInfo = styled('div')({
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

export const BranchInfo = styled('div')({
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

export const ProgressSection = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(-1),
}));

export const ProgressBarContainer = styled('div')({
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

export const ContentLayout = styled('div')(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  alignItems: "flex-start",
  [theme.breakpoints.down("lg")]: {
    flexDirection: "column",
  },
}));

export const TableContainer = styled('div')(({ theme }) => ({
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

export const AddInvoiceButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  width: 36,
  height: 36,
  color: theme.palette.text.secondary,
}));

export const InvoiceCard = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: "16px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px",
}));

export const InvoiceCardInfo = styled('div')({
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

export const InvoiceTotalCard = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: theme.spacing(1),
  borderRadius: "12px",
  padding: "16px",
  backgroundColor: theme.palette.background.lowGray
}));

export const InvoiceAmountAlert = styled(Alert)(({ theme }) => ({
  borderRadius: 8,
  backgroundColor: "#FFEDD5"
}));

export const Table = styled(MuiTable)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));