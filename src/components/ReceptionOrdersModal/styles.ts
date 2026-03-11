import { styled } from "@mui/material/styles";
import { DialogContent as MuiDialogContent, Typography, IconButton, Box, Button, TableCell, TableRow, TableContainer as MuiTableContainer, TextField } from "@mui/material";
import { colors } from "@/styles/theme";

export const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
    padding: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    "&:first-of-type": {
        paddingTop: theme.spacing(3),
    },
}));

export const ModalHeader = styled("div")({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
});

export const ModalTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1.25rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.text.secondary,
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
}));

export const TableContainer = styled(MuiTableContainer)({
    width: "100%",
    flex: 1,
    minHeight: 200,
    maxHeight: "60vh",
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
});

export const StyledTableRow = styled(TableRow)<{ selected?: boolean }>(({ selected, theme }) => ({
    "&:hover": {
        backgroundColor: colors.background.main,
    },
    ...(selected && {
        backgroundColor: theme.palette.action.selected,
    }),
}));

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

export const ModalActions = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${colors.border}`,
}));

export const ConfirmButton = styled(Button)(({ theme }) => ({
    minWidth: 100,
    textTransform: "none",
    fontWeight: 500,
}));
