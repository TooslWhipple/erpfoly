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

export const TableWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  backgroundColor: theme.palette.app.background.sidebar,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
}));

export const StyledTableContainer = styled(TableContainer)({
  overflow: "auto",
  position: "relative",
  maxWidth: "100%",
  width: "100%",
  boxShadow: "none",
});

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.app.background.main,
}));

export const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  fontSize: 14,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.app.border}`,
  padding: "12px 16px",
  whiteSpace: "nowrap",
  backgroundColor: theme.palette.app.background.main,
  [theme.breakpoints.down("sm")]: {
    padding: "10px 12px",
    fontSize: 13,
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: theme.palette.app.background.main,
    "& td": {
      backgroundColor: theme.palette.app.background.main,
    },
    "& .sticky-cell": {
      backgroundColor: `${theme.palette.app.background.main} !important`,
    },
  },
  "&:last-child td": {
    borderBottom: "none",
  },
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.app.border}`,
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

export const ActionsHeaderCell = styled(StyledHeaderCell)(({ theme }) => ({
  position: "sticky",
  right: 0,
  zIndex: 3,
  backgroundColor: theme.palette.app.background.main,
  boxShadow: "-4px 0 8px rgba(0, 0, 0, 0.04)",
  width: 56,
  minWidth: 56,
  maxWidth: 56,
  padding: "12px",
}));

export const ActionsCell = styled(TableCell)(({ theme }) => ({
  position: "sticky",
  right: 0,
  zIndex: 1,
  backgroundColor: theme.palette.app.background.sidebar,
  boxShadow: "-4px 0 8px rgba(0, 0, 0, 0.04)",
  width: 56,
  minWidth: 56,
  maxWidth: 56,
  padding: "8px 12px",
  borderBottom: `1px solid ${theme.palette.app.border}`,
  transition: "background-color 0.15s ease",
}));

export const StickyHeaderCell = styled(StyledHeaderCell)<{ position?: "left" | "right" }>(
  ({ theme, position = "right" }) => ({
    position: "sticky",
    [position]: 0,
    zIndex: 3,
    backgroundColor: `${theme.palette.app.background.main} !important`,
    boxShadow:
      position === "right" ? "-4px 0 8px rgba(0, 0, 0, 0.04)" : "4px 0 8px rgba(0, 0, 0, 0.04)",
  }),
);

export const StickyCell = styled(StyledTableCell)<{ position?: "left" | "right" }>(
  ({ theme, position = "right" }) => ({
    position: "sticky",
    [position]: 0,
    zIndex: 1,
    backgroundColor: theme.palette.app.background.sidebar,
    boxShadow:
      position === "right" ? "-4px 0 8px rgba(0, 0, 0, 0.04)" : "4px 0 8px rgba(0, 0, 0, 0.04)",
    transition: "background-color 0.15s ease",
    "&.sticky-cell": {
      backgroundColor: theme.palette.app.background.sidebar,
    },
  }),
);

export const ActionsButton = styled(IconButton)({
  width: 32,
  height: 32,
});

export const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.app.border}`,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    minWidth: 160,
  },
}));

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
  borderTop: `1px solid ${theme.palette.app.border}`,
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
  color: theme.palette.text.secondary,
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
