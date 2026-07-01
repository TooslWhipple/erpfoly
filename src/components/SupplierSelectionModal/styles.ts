import { styled } from "@mui/material/styles";
import { TextField, Button, Box, Table, TableCell } from "@mui/material";
import { theme } from "@/styles/theme";

export const SupplierModalContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
}));

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

export const Card = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "16px",
    padding: "24px",
    [theme.breakpoints.down("sm")]: {
        padding: "0px",
        backgroundColor: "transparent",
        border: "none",
        borderRadius: "0px",
    },
}));

export const SuppliersList = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    maxHeight: 400,
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: 8,
}));

export const SupplierRow = styled(Box)<{ index: number }>(({ theme, index }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2),
    borderTop: (index === 0) ? `none` : `1px solid ${theme.palette.app.border}`,
}));

export const SupplierId = styled(Box)(({ theme }) => ({
    fontSize: 14,
    fontWeight: 500,
    color: theme.palette.text.primary,
}));

export const SupplierName = styled(Box)(({ theme }) => ({
    fontSize: 14,
    color: theme.palette.text.secondary,
}));

export const SelectButton = styled(Button)(({ theme }) => ({
    textTransform: "none",
    fontWeight: 500,
    color: theme.palette.primary.main,
    "&:hover": {
        backgroundColor: "transparent",
        textDecoration: "underline",
    },
}));

export const SupplierTable = styled(Table)({
    tableLayout: "fixed",
    width: "100%",
});

export const SupplierTableCell = styled(TableCell)(({ theme }) => ({
    padding: "12px 8px",
}));

export const SupplierTableHeaderCell = styled(SupplierTableCell)(({ theme }) => ({
    color: theme.palette.text.secondary,
    padding: "12px 8px"
}));

export const SupplierNameTableCell = styled(TableCell)({
    padding: "12px 8px",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
});
