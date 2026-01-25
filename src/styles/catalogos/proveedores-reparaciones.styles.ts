import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, Button } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export const TabsWrapper = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

// ============================================================================
// SETTINGS TAB COMPONENTS
// ============================================================================

export const SettingsCard = styled(Paper)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: theme.spacing(3),
    width: "100%",
    boxShadow: "none",
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#232325",
    marginBottom: theme.spacing(2),
}));

export const FieldContainer = styled(Box)({
    maxWidth: 420,
});

export const SaveButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
    height: 40,
    minWidth: 160,
}));

export const HelperNote = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: "#71717A",
    marginTop: theme.spacing(2),
    maxWidth: 600,
    lineHeight: 1.5,
}));
