import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, Button, IconButton, RadioGroup, FormControlLabel, Radio } from "@mui/material";
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

export const SaveButton = styled(Button)(({ theme }) => ({
    height: 40,
    minWidth: 112,
    fontWeight: 600
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
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1rem",
    fontWeight: 600,
    color: "#232325",
    marginBottom: theme.spacing(2),
}));

export const SectionDescription = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
}));

export const Section = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    "&:last-child": {
        marginBottom: 0,
    },
}));

// ============================================================================
// RADIO BUTTONS
// ============================================================================

export const RadioGroupContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
}));

export const RadioLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    fontWeight: 400,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

export const StyledRadioGroup = styled(RadioGroup)({
    display: "flex",
    flexDirection: "row",
    gap: 16,
});

export const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
    margin: 0,
    "& .MuiFormControlLabel-label": {
        fontSize: "0.875rem",
        color: theme.palette.text.primary,
    },
}));

// ============================================================================
// DYNAMIC LISTS (CONTACTS, BANK ACCOUNTS, PROMOTIONS)
// ============================================================================

export const DynamicListContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));

export const DynamicListItem = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    position: "relative",
}));

export const DeleteButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.text.secondary,
    padding: theme.spacing(0.5),
    alignSelf: "flex-end",
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.text.primary,
    },
}));

export const DeleteButtonWrapper = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
        position: "absolute",
        top: theme.spacing(1),
        right: theme.spacing(1),
        zIndex: 1,
    },
}));

export const AddButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(1),
    alignSelf: "flex-start",
    textTransform: "none",
    fontWeight: 500,
}));
