import { styled } from "@mui/material/styles";
import {
  Box,
  TableCell,
  TableContainer as MuiTableContainer,
  TableRow,
  TextField,
  Paper,
} from "@mui/material";
import { theme } from "@/styles/theme";

export const SearchInput = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
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

export const TabsRow = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.app.border}`,
}));

export const TabButton = styled("button", {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: theme.spacing(1, 1.5),
  marginBottom: -1,
  fontSize: "0.875rem",
  fontWeight: active ? 600 : 500,
  color: active
    ? theme.palette.text.primary
    : theme.palette.text.secondary,
  borderBottom: active
    ? `2px solid ${theme.palette.primary.main}`
    : "2px solid transparent",
}));

export const SuggestedCard = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.primary.main}`,
  borderRadius: 8,
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
}));

export const SuggestedHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

export const TableContainer = styled(MuiTableContainer)({
  width: "100%",
  maxHeight: 280,
  overflow: "auto",
});

export const GeneralTableContainer = styled(MuiTableContainer)({
  width: "100%",
  flex: 1,
  minHeight: 200,
  maxHeight: "40vh",
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  overflow: "auto",
});

export const StyledTableRow = styled(TableRow)<{ selected?: boolean }>(
  ({ selected, theme }) => ({
    "&:hover": {
      backgroundColor: theme.palette.background.default,
    },
    ...(selected && {
      backgroundColor: theme.palette.action.selected,
    }),
  }),
);

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.app.border}`,
  fontSize: "0.875rem",
  color: theme.palette.text.primary,
}));

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  minHeight: 200,
}));

export const ModalContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
});
