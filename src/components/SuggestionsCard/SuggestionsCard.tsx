import { Stack, Typography } from "@mui/material";
import { Lightbulb as LightbulbIcon } from "@mui/icons-material";
import type { ProductSuggestion } from "@/types/suggestions.types";
import {
    SuggestionsCardContainer,
    SuggestionsHeader,
    SuggestionsTitle,
    SuggestionsSubtitle,
    SuggestionsIcon,
    SuggestionsList,
    ProductItem,
    ProductImage,
    ProductInfo,
    ProductName,
    ProductSku,
    StockInfo,
    StockValue,
    StockLabel,
    DemandData,
    DemandColumn,
    DemandLabel,
    DemandValue,
    TrendChart,
    TrendChartContainer,
    TrendLine,
    TrendArea,
    TrendAxis,
    TrendMonth,
} from "./styles";

// ============================================================================
// TYPES
// ============================================================================

export interface SuggestionsCardProps {
    products: ProductSuggestion[];
    loading?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function getMaxTrendValue(trendData: { value: number }[]): number {
    return Math.max(...trendData.map((d) => d.value), 1);
}

function normalizeTrendValue(value: number, maxValue: number, height: number): number {
    return (value / maxValue) * height;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SuggestionsCard({ products, loading = false }: SuggestionsCardProps) {
    if (loading) {
        return (
            <SuggestionsCardContainer>
                <SuggestionsHeader>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <SuggestionsIcon>
                            <LightbulbIcon sx={{ fontSize: 20, color: "#FCD34D" }} />
                        </SuggestionsIcon>
                        <SuggestionsTitle>Sugerencias</SuggestionsTitle>
                    </Stack>
                </SuggestionsHeader>
                <Stack sx={{ padding: 2, color: "#71717A", fontSize: 14 }}>Cargando...</Stack>
            </SuggestionsCardContainer>
        );
    }

    if (products.length === 0) {
        return (
            <SuggestionsCardContainer>
                <SuggestionsHeader>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <SuggestionsIcon>
                            <LightbulbIcon sx={{ fontSize: 20, color: "#FCD34D" }} />
                        </SuggestionsIcon>
                        <SuggestionsTitle>Sugerencias</SuggestionsTitle>
                    </Stack>
                </SuggestionsHeader>
                <Stack sx={{ padding: 2, color: "#71717A", fontSize: 14 }}>
                    No hay sugerencias disponibles
                </Stack>
            </SuggestionsCardContainer>
        );
    }

    return (
        <SuggestionsCardContainer>
            <SuggestionsHeader>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <SuggestionsIcon>
                        <LightbulbIcon sx={{ fontSize: 20, color: "#FCD34D" }} />
                    </SuggestionsIcon>
                    <SuggestionsTitle>Sugerencias</SuggestionsTitle>
                </Stack>
            </SuggestionsHeader>
            <SuggestionsSubtitle>
                Productos próximos a agotarse y con alta demanda en los últimos meses.
            </SuggestionsSubtitle>

            <SuggestionsList>
                {products.map((product) => {
                    const maxTrendValue = getMaxTrendValue(product.trendData);
                    const chartHeight = 40;

                    return (
                        <ProductItem key={product.id}>
                            <Stack direction="row" spacing={1.5} sx={{ marginBottom: 1.5 }}>
                                <ProductImage />
                                <ProductInfo>
                                    <ProductName>{product.name}</ProductName>
                                    <ProductSku>{product.sku}</ProductSku>
                                </ProductInfo>
                            </Stack>

                            <StockInfo>
                                <StockValue>{product.currentStock} unidades</StockValue>
                                <StockLabel>Stock actual</StockLabel>
                            </StockInfo>

                            <DemandData>
                                <DemandColumn>
                                    <DemandLabel>Últ. año</DemandLabel>
                                    <DemandValue>{product.demandData.lastYear}</DemandValue>
                                </DemandColumn>
                                <DemandColumn>
                                    <DemandLabel>Últ. mes</DemandLabel>
                                    <DemandValue>{product.demandData.lastMonth}</DemandValue>
                                </DemandColumn>
                                <DemandColumn>
                                    <DemandLabel>Mes act.</DemandLabel>
                                    <DemandValue>{product.demandData.currentMonth}</DemandValue>
                                </DemandColumn>
                            </DemandData>

                            <TrendChartContainer>
                                <TrendChart>
                                    <svg width="100%" height={chartHeight} style={{ overflow: "visible" }}>
                                        <defs>
                                            <linearGradient id={`gradient-${product.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#2663EB" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#2663EB" stopOpacity="0.05" />
                                            </linearGradient>
                                        </defs>
                                        <TrendArea
                                            d={`M 0,${chartHeight} ${product.trendData
                                                .map(
                                                    (point, index) =>
                                                        `L ${(index * 100) / (product.trendData.length - 1)},${
                                                            chartHeight - normalizeTrendValue(point.value, maxTrendValue, chartHeight)
                                                        }`
                                                )
                                                .join(" ")} L ${100},${chartHeight} Z`}
                                            fill={`url(#gradient-${product.id})`}
                                        />
                                        <TrendLine
                                            d={`M ${product.trendData
                                                .map(
                                                    (point, index) =>
                                                    `${(index * 100) / (product.trendData.length - 1)},${
                                                        chartHeight - normalizeTrendValue(point.value, maxTrendValue, chartHeight)
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
                        </ProductItem>
                    );
                })}
            </SuggestionsList>
        </SuggestionsCardContainer>
    );
}
