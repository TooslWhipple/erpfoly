import { styled } from "@mui/material/styles";
import {
  Box,
  TableCell,
  TableContainer as MuiTableContainer,
  TableRow,
  TextField,
} from "@mui/material";
import { colors } from "@/styles/theme";

export const SearchInput = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    backgroundColor: colors.background.sidebar,
    "& fieldset": {
      borderColor: colors.border,
    },
    "&:hover fieldset": {
      borderColor: colors.border,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

export const TableContainer = styled(MuiTableContainer)({
  width: "100%",
  flex: 1,
  minHeight: 200,
  maxHeight: "60vh",
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  overflow: "auto",
});

export const StyledTableRow = styled(TableRow)<{ selected?: boolean }>(
  ({ selected, theme }) => ({
    "&:hover": {
      backgroundColor: colors.background.main,
    },
    ...(selected && {
      backgroundColor: theme.palette.action.selected,
    }),
  })
);

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${colors.border}`,
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

const AddArticlesModalStylesPage = () => null;

export default AddArticlesModalStylesPage;
