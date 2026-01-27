import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { colors } from "@/styles/theme";

export const SuggestionCardContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.background.sidebar,
    minWidth: 240,
    maxWidth: 280,
}));

export const ProductImage = styled(Box)(({ theme }) => ({
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: colors.background.main,
    border: `1px solid ${colors.border}`,
    flexShrink: 0,
}));

export const ProductInfo = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
    minWidth: 0,
});

export const ProductName = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    fontWeight: 500,
    color: theme.palette.text.primary,
    lineHeight: 1.4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
}));

export const ProductSku = styled(Typography)(({ theme }) => ({
    fontSize: 12,
    color: theme.palette.text.secondary,
}));

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

export const DemandStatLabel = styled(Typography)(({ theme }) => ({
    fontSize: 11,
    color: theme.palette.text.secondary,
}));

export const DemandStatValue = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

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

export const TrendMonth = styled(Typography)(({ theme }) => ({
    fontSize: 10,
    color: theme.palette.text.secondary,
}));