import { styled } from "@mui/material/styles";
import {
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

export const GoalsTableWrapper = styled("div")({
  width: "100%",
});

export const GoalsTableContainer = styled(TableContainer)({
  overflow: "auto",
  position: "relative",
  maxWidth: "100%",
  width: "100%",
  boxShadow: "none",
});

export const GoalsTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

export const GoalsHeaderRow = styled(TableRow)({
  "&:hover": {
    backgroundColor: "transparent",
  },
});

export const GoalsHeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 500,
  fontSize: 14,
  color: theme.palette.text.secondary,
  borderBottom: `1px solid ${theme.palette.app.border}`,
  padding: theme.spacing(1.5, 2),
  textAlign: "left",
  whiteSpace: "nowrap",
  backgroundColor: theme.palette.common.white,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.25, 1.5),
    fontSize: 13,
  },
}));

export const GoalsTableRow = styled(TableRow)(({ theme }) => ({
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    "& td": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  "&:last-child td": {
    borderBottom: "none",
  },
}));

export const GoalsTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.app.border}`,
  padding: theme.spacing(1.5, 2),
  backgroundColor: theme.palette.common.white,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.25, 1.5),
    fontSize: 13,
  },
}));

export const BranchNameCell = styled(GoalsTableCell)({
  minWidth: 180,
});

export const BranchNameLink = styled("button")(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(0.75),
  padding: 0,
  border: "none",
  background: "none",
  cursor: "pointer",
  font: "inherit",
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.primary,
  textAlign: "left",
  "&:hover:not(:disabled)": {
    color: theme.palette.primary.main,
  },
  "&:disabled": {
    cursor: "default",
  },
}));

export const EditableCell = styled(GoalsTableCell)(({ theme }) => ({
  padding: theme.spacing(1, 1.5),
  verticalAlign: "middle",
}));

export const GoalCellInput = styled(TextField)(({ theme }) => ({
  width: "100%",
  minWidth: 100,
  "& .MuiOutlinedInput-root": {
    height: 36,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    "& fieldset": {
      borderColor: theme.palette.app.border,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.text.secondary,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: 1,
    },
    "& input": {
      padding: theme.spacing(0.75, 1.25),
      fontSize: 14,
      textAlign: "left",
    },
  },
}));

export const GoalsEmptyCell = styled(TableCell)(({ theme }) => ({
  borderBottom: "none",
  backgroundColor: theme.palette.common.white,
}));

export const SaveButtonWrapper = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: 12,
});
