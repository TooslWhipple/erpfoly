import { Box, Button, Typography } from "@mui/material";
import type { ProductSuggestion } from "@/types/suggestions.types";
import {
    SuggestionCardContainer,
    ProductImage,
    ProductInfo,
    QuantityBadge,
    DemandStats,
    DemandStatItem,
    TrendChartContainer,
    TrendChart,
    TrendLine,
    TrendArea,
    TrendAxis,
} from "./styles";

export interface ProductSuggestionCardProps {
    product: ProductSuggestion;
    onAdd?: (product: ProductSuggestion) => void;
}

function getMaxTrendValue(trendData: { value: number }[]): number {
    return Math.max(...trendData.map((d) => d.value), 1);
}

function normalizeTrendValue(value: number, maxValue: number, height: number): number {
    return (value / maxValue) * height;
}

export function ProductSuggestionCard({ product, onAdd }: ProductSuggestionCardProps) {
    const maxTrendValue = getMaxTrendValue(product.trendData);
    const chartHeight = 40;

    const handleAdd = () => {
        if (onAdd) {
            onAdd(product);
        }
    };

    return (
        <SuggestionCardContainer>
            <Box sx={{ display: "flex", gap: 1.5, marginBottom: 1.5 }}>
                <ProductImage />
                <ProductInfo>
                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {product.name}
                    </Typography>
                    <Typography variant="caption">
                        {product.sku}
                    </Typography>
                </ProductInfo>
            </Box>

            <QuantityBadge>{product.currentStock} unidades</QuantityBadge>

            <DemandStats>
                <DemandStatItem>
                    <Typography variant="caption" sx={{ fontSize: 11 }}>
                        Últ. año
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.demandData.lastYear}
                    </Typography>
                </DemandStatItem>
                <DemandStatItem>
                    <Typography variant="caption" sx={{ fontSize: 11 }}>
                        Últ. mes
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.demandData.lastMonth}
                    </Typography>
                </DemandStatItem>
                <DemandStatItem>
                    <Typography variant="caption" sx={{ fontSize: 11 }}>
                        Mes act.
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.demandData.currentMonth}
                    </Typography>
                </DemandStatItem>
            </DemandStats>

            <TrendChartContainer>
                <TrendChart>
                    <svg width="100%" height={chartHeight} style={{ overflow: "visible" }}>
                        <defs>
                            <linearGradient
                                id={`gradient-${product.id}`}
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                            >
                                <stop offset="0%" stopColor="#2663EB" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#2663EB" stopOpacity="0.05" />
                            </linearGradient>
                        </defs>
                        <TrendArea
                            d={`M 0,${chartHeight} ${product.trendData
                                .map(
                                    (point, index) =>
                                        `L ${(index * 100) / (product.trendData.length - 1)},${chartHeight -
                                        normalizeTrendValue(point.value, maxTrendValue, chartHeight)
                                        }`
                                )
                                .join(" ")} L ${100},${chartHeight} Z`}
                            fill={`url(#gradient-${product.id})`}
                        />
                        <TrendLine
                            d={`M ${product.trendData
                                .map(
                                    (point, index) =>
                                        `${(index * 100) / (product.trendData.length - 1)},${chartHeight -
                                        normalizeTrendValue(point.value, maxTrendValue, chartHeight)
                                        }`
                                )
                                .join(" L ")}`}
                            fill="none"
                            stroke="#2663EB"
                            strokeWidth="2"
                        />
                    </svg>
                </TrendChart>
                <TrendAxis>
                    {product.trendData.map((point, index) => (
                        <Typography key={index} variant="caption" sx={{ fontSize: 10 }}>
                            {point.month}
                        </Typography>
                    ))}
                </TrendAxis>
            </TrendChartContainer>

            <Button
                variant="text"
                color="primary"
                onClick={handleAdd} fullWidth>
                Agregar
            </Button>
        </SuggestionCardContainer>
    );
}
