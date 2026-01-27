import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, IconButton, TextField } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export const BreadcrumbsContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

export const PageHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(3),
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        alignItems: "flex-start",
    },
}));

export const PageTitle = styled(Typography)({
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#232325",
});

export const SaveButton = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
}));

// ============================================================================
// TABS CONTAINER
// ============================================================================

export const TabsContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

// ============================================================================
// FORM COMPONENTS
// ============================================================================

export const FormCard = styled(Paper)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: theme.spacing(3),
    width: "100%",
    boxShadow: "none",
    marginBottom: theme.spacing(3),
    "&:last-child": {
        marginBottom: 0,
    },
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1rem",
    fontWeight: 600,
    color: "#232325",
    marginBottom: theme.spacing(1),
}));

export const SectionDescription = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
}));

export const Section = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    "&:last-child": {
        marginBottom: 0,
    },
}));

// ============================================================================
// NUMBER INPUT WITH BUTTONS
// ============================================================================

export const NumberInputContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
}));

export const NumberInputWrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    backgroundColor: "#F5F5F5", // Light grey background
    padding: theme.spacing(0.5),
    boxShadow: "none",
}));

export const NumberInputButton = styled(IconButton)(({ theme }) => ({
    width: 36,
    height: 36,
    minWidth: 36,
    padding: 0,
    backgroundColor: "#FFFFFF", // White background
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    color: theme.palette.text.secondary,
    "&:hover": {
        backgroundColor: "#F9F9F9",
        borderColor: theme.palette.primary.main,
    },
    "&:active": {
        backgroundColor: "#F0F0F0",
    },
    "&:disabled": {
        opacity: 0.4,
        backgroundColor: "#FFFFFF",
        borderColor: colors.border,
    },
    transition: "all 0.2s ease",
}));

export const NumberInputField = styled(TextField)(({ theme }) => ({
    width: 80,
    minWidth: 80,
    "& .MuiOutlinedInput-root": {
        height: 36,
        backgroundColor: "transparent",
        "& fieldset": {
            border: "none",
        },
        "& input": {
            padding: theme.spacing(0.5, 1),
            textAlign: "center",
            fontSize: "0.9375rem",
            fontWeight: 700, // Bold number
            color: "#232325",
        },
        "&:hover fieldset": {
            border: "none",
        },
        "&.Mui-focused fieldset": {
            border: "none",
        },
    },
}));

export const NumberInputLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    fontWeight: 400,
    margin: theme.spacing(0, 1),
}));

export const NumberInputArrow = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    color: theme.palette.text.secondary,
    fontSize: "1.25rem",
    margin: theme.spacing(0, 1),
}));

export const CurrencyInputWrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    backgroundColor: "#F5F5F5", // Light grey background
    padding: theme.spacing(0.5),
    boxShadow: "none",
}));

export const CurrencyInputField = styled(TextField)(({ theme }) => ({
    width: 100,
    minWidth: 100,
    "& .MuiOutlinedInput-root": {
        height: 36,
        backgroundColor: "transparent",
        "& fieldset": {
            border: "none",
        },
        "& input": {
            padding: theme.spacing(0.5, 1),
            textAlign: "center",
            fontSize: "0.9375rem",
            fontWeight: 700, // Bold number
            color: "#232325",
        },
        "&:hover fieldset": {
            border: "none",
        },
        "&.Mui-focused fieldset": {
            border: "none",
        },
    },
}));

export const CurrencySymbol = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(0.5),
}));
