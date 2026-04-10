import { styled } from "@mui/material/styles";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import { colors } from "@/styles/theme";

export const TableWrapper = styled('div')({
  width: "100%",
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  overflow: "hidden",
});

export const StyledTableContainer = styled(TableContainer)({
  overflow: "auto",
  position: "relative",
  maxWidth: "100%",
  width: "100%",
  boxShadow: "none",
});

export const StyledTableHead = styled(TableHead)({
  backgroundColor: colors.background.main,
});

export const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  fontSize: 14,
  color: "#232325",
  borderBottom: `1px solid ${colors.border}`,
  padding: "12px 16px",
  whiteSpace: "nowrap",
  backgroundColor: colors.background.main,
  [theme.breakpoints.down("sm")]: {
    padding: "10px 12px",
    fontSize: 13,
  },
}));

export const StyledTableRow = styled(TableRow)({
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: colors.background.main,
    "& td": {
      backgroundColor: colors.background.main,
    },
    "& .sticky-cell": {
      backgroundColor: `${colors.background.main} !important`,
    },
  },
  "&:last-child td": {
    borderBottom: "none",
  },
});

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: 14,
  color: "#232325",
  borderBottom: `1px solid ${colors.border}`,
  padding: "12px 16px",
  [theme.breakpoints.down("sm")]: {
    padding: "10px 12px",
    fontSize: 13,
  },
}));

export const TruncatedCell = styled(StyledTableCell)({
  maxWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const NumberCell = styled(StyledTableCell)({
  fontVariantNumeric: "tabular-nums",
});

export const ActionsHeaderCell = styled(StyledHeaderCell)({
  position: "sticky",
  right: 0,
  zIndex: 3,
  backgroundColor: colors.background.main,
  boxShadow: "-4px 0 8px rgba(0, 0, 0, 0.04)",
  width: 56,
  minWidth: 56,
  maxWidth: 56,
  padding: "12px",
});

export const ActionsCell = styled(TableCell)({
  position: "sticky",
  right: 0,
  zIndex: 1,
  backgroundColor: colors.background.sidebar,
  boxShadow: "-4px 0 8px rgba(0, 0, 0, 0.04)",
  width: 56,
  minWidth: 56,
  maxWidth: 56,
  padding: "8px 12px",
  borderBottom: `1px solid ${colors.border}`,
  transition: "background-color 0.15s ease",
});

export const StickyHeaderCell = styled(StyledHeaderCell)<{ position?: "left" | "right" }>(({ position = "right" }) => ({
  position: "sticky",
  [position]: 0,
  zIndex: 3,
  backgroundColor: `${colors.background.main} !important`,
  boxShadow: position === "right" ? "-4px 0 8px rgba(0, 0, 0, 0.04)" : "4px 0 8px rgba(0, 0, 0, 0.04)",
}));

export const StickyCell = styled(StyledTableCell)<{ position?: "left" | "right" }>(({ position = "right" }) => ({
  position: "sticky",
  [position]: 0,
  zIndex: 1,
  backgroundColor: colors.background.sidebar,
  boxShadow: position === "right" ? "-4px 0 8px rgba(0, 0, 0, 0.04)" : "4px 0 8px rgba(0, 0, 0, 0.04)",
  transition: "background-color 0.15s ease",
  "&.sticky-cell": {
    backgroundColor: colors.background.sidebar,
  },
}));

export const ActionsButton = styled(IconButton)({
  width: 32,
  height: 32,
});

export const StyledMenu = styled(Menu)({
  "& .MuiPaper-root": {
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    minWidth: 160,
  },
});

export const StyledMenuItem = styled(MenuItem)({
  fontSize: 14,
  padding: "8px 16px",
  gap: 8,
  "& .MuiSvgIcon-root": {
    width: 16,
    height: 16,
  },
});

export const StyledTablePagination = styled(TablePagination)(({ theme }) => ({
  borderTop: `1px solid ${colors.border}`,
  overflow: "hidden",
  display: "flex",
  justifyContent: "flex-end",
  "& .MuiTablePagination-toolbar": {
    minHeight: 52,
    flexWrap: "wrap",
    justifyContent: "flex-end",
    padding: "0 16px",
    [theme.breakpoints.down("sm")]: {
      minHeight: 48,
      padding: "8px",
    },
  },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
    fontSize: 14,
    [theme.breakpoints.down("sm")]: {
      fontSize: 12,
    },
  },
  "& .MuiTablePagination-select": {
    [theme.breakpoints.down("sm")]: {
      fontSize: 12,
    },
  },
  "& .MuiTablePagination-actions": {
    marginLeft: 8,
    flexShrink: 0,
    [theme.breakpoints.down("sm")]: {
      marginLeft: 4,
    },
  },
  "& .MuiTablePagination-spacer": {
    display: "none",
  },
}));

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  color: "text.secondary",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(4),
  },
}));

export const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(4),
  },
}));
