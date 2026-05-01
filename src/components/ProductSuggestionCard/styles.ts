import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { theme } from "@/styles/theme";

export const SuggestionCardContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
    borderRadius: 8,
    border: `1px solid ${theme.palette.app.border}`,
    backgroundColor: theme.palette.background.paper,
    minWidth: 240,
    maxWidth: 280,
}));

export const ProductImage = styled(Box)(({ theme }) => ({
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.app.border}`,
    flexShrink: 0,
}));

export const ProductInfo = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
    minWidth: 0,
});

// ProductName uses Typography variant="body2" with fontWeight 500
// ProductSku uses Typography variant="caption"

export const QuantityBadge = styled(Box)(({ theme }) => ({
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
}));

export const DemandStats = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
}));

export const DemandStatItem = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
});

// DemandStatLabel uses Typography variant="caption" with fontSize 11
// DemandStatValue uses Typography variant="body2" with fontWeight 600

export const TrendChartContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(1.5),
}));

export const TrendChart = styled(Box)({
    width: "100%",
    height: 40,
    marginBottom: 4,
});

export const TrendLine = styled("path")({
    fill: "none",
    stroke: "#2663EB",
    strokeWidth: 2,
});

export const TrendArea = styled("path")({
    fill: "url(#gradient)",
});

export const TrendAxis = styled(Box)({
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
});

// TrendMonth uses Typography variant="caption" with fontSize 10