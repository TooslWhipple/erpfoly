import { styled } from "@mui/material/styles";
import {
  Box,
  Checkbox,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export const TableContainer = styled(Box)({
  width: "100%",
  overflowX: "auto",
});

export const StyledTable = styled(Table)({
  width: "100%",
  borderCollapse: "collapse",
});

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.app.background.main,
}));

export const HeaderRow = styled(TableRow)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.app.border}`,
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.app.background.main,
  },
}));

export const ModuleCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.app.border}`,
  padding: "12px 16px",
  fontSize: "0.875rem",
  color: theme.palette.text.primary,
  width: "40%",
}));

export const HeaderModuleCell = styled(ModuleCell)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

export const PermissionCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.app.border}`,
  padding: "8px 16px",
  textAlign: "center",
  width: "15%",
}));

export const HeaderPermissionCell = styled(PermissionCell)({
  padding: "10px 16px",
});

export const CheckboxWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
}));

export const PermissionLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.primary.main,
  fontWeight: 500,
}));

export const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: 4,
  "&.Mui-checked": {
    color: theme.palette.primary.main,
  },
}));
