import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { theme } from "@/styles/theme";

// ============================================================================
// MAIN CONTAINER
// ============================================================================

export const SuggestionsCardContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: 8,
    padding: theme.spacing(2.5),
    width: "100%",
    maxWidth: 400,
    position: "sticky",
    top: theme.spacing(2),
    alignSelf: "flex-start",
    [theme.breakpoints.down("lg")]: {
        maxWidth: "100%",
        position: "relative",
        top: 0,
    },
}));

// ============================================================================
// HEADER
// ============================================================================

export const SuggestionsHeader = styled(Box)({
    marginBottom: 12,
});

export const SuggestionsIcon = styled(Box)({
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#FEF3C7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
});

export const SuggestionsTitle = styled(Typography)(({ theme }) => ({
    fontSize: 18,
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

export const SuggestionsSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: 13,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
    lineHeight: 1.5,
}));

// ============================================================================
// PRODUCT LIST
// ============================================================================

export const SuggestionsList = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 20,
});

export const ProductItem = styled(Box)(({ theme }) => ({
    paddingBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.app.border}`,
    "&:last-child": {
        borderBottom: "none",
        paddingBottom: 0,
    },
}));

export const ProductImage = styled(Box)({
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    flexShrink: 0,
});

export const ProductInfo = styled(Box)({
    flex: 1,
    minWidth: 0,
});

export const ProductName = styled(Typography)(({ theme }) => ({
    fontSize: 15,
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: 4,
    lineHeight: 1.3,
}));

export const ProductSku = styled(Typography)(({ theme }) => ({
    fontSize: 12,
    color: theme.palette.text.secondary,
}));

// ============================================================================
// STOCK INFO
// ============================================================================

export const StockInfo = styled(Box)({
    marginTop: 12,
    marginBottom: 12,
});

export const StockValue = styled(Typography)(({ theme }) => ({
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: 4,
    "&::after": {
        content: '""',
        display: "block",
        width: "100%",
        height: 2,
        backgroundColor: "#DC2626",
        marginTop: 2,
    },
}));

export const StockLabel = styled(Typography)(({ theme }) => ({
    fontSize: 12,
    color: theme.palette.text.secondary,
}));

// ============================================================================
// DEMAND DATA
// ============================================================================

export const DemandData = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: 12,
}));

export const DemandColumn = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 4,
});

export const DemandLabel = styled(Typography)(({ theme }) => ({
    fontSize: 11,
    color: theme.palette.text.secondary,
}));

export const DemandValue = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

// ============================================================================
// TREND CHART
// ============================================================================

export const TrendChartContainer = styled(Box)({
    marginTop: 8,
});

export const TrendChart = styled(Box)({
    width: "100%",
    height: 40,
    marginBottom: 4,
});

export const TrendLine = styled("path")({
    strokeLinecap: "round",
    strokeLinejoin: "round",
});

export const TrendArea = styled("path")({
    stroke: "none",
});

export const TrendAxis = styled(Box)({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
});

export const TrendMonth = styled(Typography)(({ theme }) => ({
    fontSize: 10,
    color: theme.palette.text.secondary,
    textAlign: "center",
    flex: 1,
}));
