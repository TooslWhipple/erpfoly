import { styled } from "@mui/material/styles";
import { TextField, Button, Box } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// MAIN CONTAINER
// ============================================================================

export const SupplierModalContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
}));

// ============================================================================
// SEARCH INPUT
// ============================================================================

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

// ============================================================================
// SUPPLIERS LIST
// ============================================================================

export const SuppliersList = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    maxHeight: 400,
    backgroundColor: colors.background.main,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
}));

export const SupplierRow = styled(Box)<{ index: number }>(({ theme, index }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2),
    borderTop: (index === 0) ? `none` : `1px solid ${colors.border}`,
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
