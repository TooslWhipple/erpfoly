import { styled } from "@mui/material/styles";
import { Box, TextField, Select, Typography } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export const PageContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    marginTop: theme.spacing(2),
}));

export const MainContent = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 24,
    flex: 1,
    minWidth: 0,
});

export const DrawerContent = styled(Box)({
    height: "100%",
    display: "flex",
    flexDirection: "column",
});

export const MobileCardContainer = styled(Box)(({ theme }) => ({
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    top: "auto",
    height: "auto",
    maxHeight: "calc(100vh - 64px)",
    backgroundColor: colors.background.sidebar,
    borderTop: `1px solid ${colors.border}`,
    boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.1)",
    zIndex: theme.zIndex.drawer + 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("md")]: {
        display: "none",
    },
}));

// ============================================================================
// HEADER
// ============================================================================

export const PageHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));

// PageTitle uses Typography variant="h1"
// SupplierSelector uses Select with inline styles from theme

// ============================================================================
// SUGGESTIONS SECTION
// ============================================================================

export const SuggestionsSection = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));

// SuggestionsTitle uses Typography variant="h4"

export const SuggestionsList = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(2),
    overflowX: "auto",
    paddingBottom: theme.spacing(1),
    "&::-webkit-scrollbar": {
        height: 6,
    },
    "&::-webkit-scrollbar-track": {
        backgroundColor: colors.background.main,
        borderRadius: 3,
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: colors.border,
        borderRadius: 3,
        "&:hover": {
            backgroundColor: "#D4D4D8",
        },
    },
}));

// ============================================================================
// ARTICLES SECTION
// ============================================================================

export const ArticlesSection = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));

export const ArticlesHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        alignItems: "stretch",
    },
}));

// ArticlesTitle uses Typography variant="h4"
// SearchInput uses TextField with inline styles from theme

// ============================================================================
// TABLE CELLS
// ============================================================================

export const StockCell = styled(Box)<{ isLow: boolean }>(({ theme, isLow }) => ({
    fontSize: 14,
    fontWeight: 500,
    color: isLow ? "#EF4444" : "#16A34A",
}));
