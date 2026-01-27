import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export const PageContent = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(3),
    [theme.breakpoints.down("lg")]: {
        flexDirection: "column",
    },
}));

export const MainContent = styled(Box)({
    flex: 1,
    minWidth: 0,
});

export const SidebarPanel = styled(Box)(({ theme }) => ({
    width: 400,
    flexShrink: 0,
    [theme.breakpoints.down("lg")]: {
        width: "100%",
    },
}));

export const TabsWrapper = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));
