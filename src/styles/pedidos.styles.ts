import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export const PageContent = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(3),
}));

export const MainContent = styled(Box)({
    flex: 1,
    minWidth: 0,
});

export const TabsWrapper = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));
