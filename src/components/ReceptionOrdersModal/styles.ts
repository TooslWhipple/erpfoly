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
