import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, Button } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export const BreadcrumbsContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

export const PageHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(3),
    gap: theme.spacing(2),
}));

export const HeaderLeft = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 8,
});

export const PageTitle = styled(Typography)({
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#232325",
});

export const SaveButton = styled(Button)({
    height: 40,
    minWidth: 120,
});

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

export const Section = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    "&:last-child": {
        marginBottom: 0,
    },
}));

export const FieldContainer = styled(Box)({
    maxWidth: 600,
});
