import { styled } from "@mui/material/styles";
import {
    Box,
    Button,
    Chip,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";

export const MonthButton = styled(Button)<{ selected?: boolean }>(({ theme, selected }) => ({
    minWidth: 64,
    minHeight: 44,
    padding: "12px 16px 12px 12px",
    backgroundColor: (selected) ? theme.palette.app.sidebar.itemSelected : theme.palette.background.paper,
    color: (selected) ? theme.palette.app.sidebar.textSelected : theme.palette.text.secondary,
    border: `1px solid ${(selected) ? theme.palette.app.sidebar.itemSelected : theme.palette.app.border}`,
    borderRadius: 12,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "8px",
    "&:hover": {
        backgroundColor: (selected) ? theme.palette.app.sidebar.itemSelected : theme.palette.action.hover,
        borderColor: (selected) ? theme.palette.app.sidebar.itemSelected : theme.palette.app.border,
    },
}));

export const MonthButtonIcon = styled(Box)<{ selected?: boolean }>(({ theme, selected }) => ({
    width: 20,
    height: 20,
    borderRadius: 6,
    border: `2px solid ${selected ? theme.palette.app.sidebar.textSelected : theme.palette.app.border}`,
    backgroundColor: selected ? theme.palette.app.sidebar.textSelected : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    "& .MuiSvgIcon-root": {
        fontSize: 14,
        color: theme.palette.background.paper,
    },
}));

export const DayButton = styled(Button)<{ selected?: boolean }>(({ theme, selected }) => ({
    minWidth: 60,
    height: 36,
    fontSize: "0.875rem",
    fontWeight: selected ? 600 : 400,
    backgroundColor: selected ? theme.palette.primary.main : "transparent",
    color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
    border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
    borderRadius: 8,
    "&:hover": {
        backgroundColor: selected ? theme.palette.primary.dark : theme.palette.action.hover,
    },
}));

export const SwitchContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
}));

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    position: "sticky",
    top: 0,
    zIndex: 1,
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 600,
    color: theme.palette.text.secondary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: "8px 16px",
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td": {
        borderBottom: "none",
    },
}));

export const ArticleTableCell = styled(TableCell)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const StatusChip = styled(Chip)<{ status: "Activo" | "Draft" }>(({ theme, status }) => ({
    height: 24,
    backgroundColor: status === "Activo" ? "#DCFCE7" : "#F8FAFC",
    color: status === "Activo" ? "#16A34A" : theme.palette.text.secondary,
    fontWeight: 500,
    borderRadius: 8
}));

export const SearchContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: theme.spacing(2),
}));