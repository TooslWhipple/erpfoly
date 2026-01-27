import { Box, Button } from "@mui/material";
import type { ProductSuggestion } from "@/types/suggestions.types";
import {
    SuggestionCardContainer,
    ProductImage,
    ProductInfo,
    ProductName,
    ProductSku,
    QuantityBadge,
    DemandStats,
    DemandStatItem,
    DemandStatLabel,
    DemandStatValue,
    TrendChartContainer,
    TrendChart,
    TrendLine,
    TrendArea,
    TrendAxis,
    TrendMonth
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
                    <ProductName>{product.name}</ProductName>
                    <ProductSku>{product.sku}</ProductSku>
                </ProductInfo>
            </Box>

            <QuantityBadge>{product.currentStock} unidades</QuantityBadge>

            <DemandStats>
                <DemandStatItem>
                    <DemandStatLabel>Últ. año</DemandStatLabel>
                    <DemandStatValue>{product.demandData.lastYear}</DemandStatValue>
                </DemandStatItem>
                <DemandStatItem>
                    <DemandStatLabel>Últ. mes</DemandStatLabel>
                    <DemandStatValue>{product.demandData.lastMonth}</DemandStatValue>
                </DemandStatItem>
                <DemandStatItem>
                    <DemandStatLabel>Mes act.</DemandStatLabel>
                    <DemandStatValue>{product.demandData.currentMonth}</DemandStatValue>
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
                        <TrendMonth key={index}>{point.month}</TrendMonth>
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
