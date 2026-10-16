import { styled } from "@mui/material/styles";
import { Box, Button, TextField, Typography } from "@mui/material";

export const SearchInput = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    backgroundColor: theme.palette.background.paper,
    "& fieldset": {
      borderColor: theme.palette.app.border,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.app.border,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

export const SupplierList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
}));

export const SupplierCard = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 12,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

export const SupplierCardInfo = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 0,
  flex: 1,
});

export const SupplierCardName = styled(Typography)(({ theme }) => ({
  fontSize: "0.9375rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  lineHeight: 1.3,
}));

export const SupplierCardLegalName = styled(Typography)(({ theme }) => ({
  fontSize: "0.8125rem",
  color: theme.palette.text.secondary,
  lineHeight: 1.3,
}));

export const SupplierCardMeta = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  whiteSpace: "nowrap",
  flexShrink: 0,
}));

export const CreateButton = styled(Button)({
  textTransform: "none",
  fontWeight: 500,
  minWidth: 88,
  flexShrink: 0,
});

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  minHeight: 200,
}));

export const InvoiceList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
}));

export const InvoiceSelectCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${
    selected ? theme.palette.primary.main : theme.palette.app.border
  }`,
  backgroundColor: theme.palette.background.paper,
  cursor: "pointer",
  transition: "border-color 0.15s ease",
}));

export const InvoiceCardBody = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 8,
  flex: 1,
  minWidth: 0,
});

export const InvoiceCardHeader = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
});

export const InvoiceCardTitleRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  minWidth: 0,
});

export const InvoiceCardFolio = styled(Typography)(({ theme }) => ({
  fontSize: "0.9375rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  lineHeight: 1.3,
}));

export const InvoiceCardDate = styled(Typography)(({ theme }) => ({
  fontSize: "0.8125rem",
  color: theme.palette.text.secondary,
  lineHeight: 1.3,
}));

export const InvoiceCardConcept = styled(Typography)(({ theme }) => ({
  fontSize: "0.8125rem",
  color: theme.palette.text.secondary,
  lineHeight: 1.4,
}));

export const InvoiceCardAmounts = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(2),
}));

export const InvoiceAmountItem = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  minWidth: 72,
});

export const InvoiceAmountLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.6875rem",
  fontWeight: 500,
  color: theme.palette.text.secondary,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
}));

export const InvoiceAmountValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "emphasized",
})<{ emphasized?: boolean }>(({ theme, emphasized }) => ({
  fontSize: emphasized ? "0.9375rem" : "0.8125rem",
  fontWeight: emphasized ? 700 : 500,
  color: theme.palette.text.primary,
  whiteSpace: "nowrap",
}));

export const InvoiceLinesList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.75),
  paddingTop: theme.spacing(0.5),
  borderTop: `1px solid ${theme.palette.app.border}`,
}));

export const InvoiceLineRow = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
});

export const InvoiceLineInfo = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  minWidth: 0,
  flex: 1,
});

export const InvoiceLinePrimary = styled(Typography)(({ theme }) => ({
  fontSize: "0.8125rem",
  color: theme.palette.text.primary,
  lineHeight: 1.3,
}));

export const InvoiceLineSecondary = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  lineHeight: 1.3,
}));

export const InvoiceLineMeta = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  whiteSpace: "nowrap",
  flexShrink: 0,
  textAlign: "right",
}));

export const InvoiceCheckbox = styled("span")({
  display: "inline-flex",
  paddingTop: 2,
  flexShrink: 0,
});
