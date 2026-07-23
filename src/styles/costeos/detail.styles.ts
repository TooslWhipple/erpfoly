import { styled } from "@mui/material/styles";
import { LinearProgress as muiLinearProgress, Typography } from "@mui/material";

export const NAME_COLUMN_MAX_WIDTH = 224;

export const NameCellText = styled(Typography)({
  display: "block",
  maxWidth: NAME_COLUMN_MAX_WIDTH,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const FlowProgressBar = styled(muiLinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.app.border,
  "& .MuiLinearProgress-bar": {
    borderRadius: 4,
    backgroundColor: theme.palette.app.chip.variants.success.color,
  },
}));

export const ExchangeRateBox = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  backgroundColor: theme.palette.background.paper,
  minWidth: "176px",
  maxWidth: "176px",
}));

export const ContentCard = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "8px",
  padding: "16px"
}));

export const SummaryCard = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.app.background.lowerBlue,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 12,
  padding: theme.spacing(2.5),
  height: "fit-content",
}));

export const BillingSummaryCard = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 12,
  padding: theme.spacing(2.5),
  height: "fit-content",
  borderTop: `4px solid ${theme.palette.app.chip.variants.success.color}`,
}));

export const BillingWarningBox = styled("div")(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: 8,
  backgroundColor: theme.palette.app.chip.variants.pending.background,
  color: theme.palette.app.chip.variants.pending.color,
  marginBottom: theme.spacing(2),
}));

export const InvoiceCard = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  padding: theme.spacing(2, 2.5),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 12,
}));

export const ExpenseModalFooter = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderRadius: 8,
  backgroundColor: theme.palette.app.background.lowerGray,
  marginTop: theme.spacing(2),
}));

export const ProductThumb = styled("div")(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: 6,
  backgroundColor: theme.palette.app.background.lowGray,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
  flexShrink: 0,
}));

export const LinearProgress = styled(muiLinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.app.border,
  "& .MuiLinearProgress-bar": {
    borderRadius: 4,
    backgroundColor: "#22C55E"
  }
}));