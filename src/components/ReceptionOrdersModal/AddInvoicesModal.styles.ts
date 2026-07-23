import { styled } from "@mui/material/styles";
import { Box, Button, Checkbox, TextField, Typography } from "@mui/material";

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

export const ResultsLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
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
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${
    selected ? theme.palette.primary.main : theme.palette.app.border
  }`,
  backgroundColor: theme.palette.background.paper,
  cursor: "pointer",
}));

export const InvoiceSelectInfo = styled(Box)({
  display: "flex",
  flex: 1,
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  minWidth: 0,
  flexWrap: "wrap",
});

export const InvoiceSelectMeta = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  minWidth: 0,
});

export const InvoiceSelectId = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const InvoiceSelectSecondary = styled(Typography)(({ theme }) => ({
  fontSize: "0.8125rem",
  color: theme.palette.text.secondary,
}));

export const InvoiceSelectAmount = styled(Typography)(({ theme }) => ({
  fontSize: "0.9375rem",
  fontWeight: 700,
  color: theme.palette.text.primary,
  whiteSpace: "nowrap",
}));

export const InvoiceCheckbox = styled(Checkbox)({
  padding: 4,
});

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  minHeight: 160,
}));

export const HeaderAddButton = styled(Button)({
  textTransform: "none",
  fontWeight: 500,
  minWidth: 100,
});
