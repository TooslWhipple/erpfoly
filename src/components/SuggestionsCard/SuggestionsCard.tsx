import { Skeleton, Stack, Typography } from "@mui/material";
import type { ProductSuggestion } from "@/types/suggestions.types";
import {
    SuggestionsIcon,
    ProductItem,
    ProductImage,
    ImagePlaceholder,
    TrendChart,
    TrendChartContainer,
    TrendLine,
    TrendArea,
    TrendAxis,
    TrendMonth,
} from "./styles";
import { Sparkle } from "lucide-react";

export interface SuggestionsCardProps {
    products: ProductSuggestion[];
    loading?: boolean;
}

function getMaxTrendValue(trendData: { value: number }[]): number {
    return Math.max(...trendData.map((d) => d.value), 1);
}

function normalizeTrendValue(value: number, maxValue: number, height: number): number {
    return (value / maxValue) * height;
}

export function SuggestionsCard({ products, loading = false }: SuggestionsCardProps) {
    if (loading) {
        return (
            <>
                <Stack sx={{ padding: 2, color: "#71717A", fontSize: 14 }}>Cargando...</Stack>
            </>
        );
    }

    if (products.length === 0) {
        return (
            <>
                <Stack sx={{ padding: 2, color: "#71717A", fontSize: 14 }}>
                    No hay sugerencias disponibles
                </Stack>
            </>
        );
    }

    return (
        <>
            <Stack spacing={1}>
                <SuggestionsIcon>
                    <Sparkle size={20} color="#F59E0B" />
                </SuggestionsIcon>
                <Typography variant="h4" fontWeight={600}>Sugerencias</Typography>
                <Typography variant="body2" color="text.secondary">Productos próximos a agotarse y con alta demanda en los últimos meses.</Typography>
            </Stack>

            {
                (loading) ?
                    [1, 2, 3].map((i) => (
                        <Skeleton key={i} variant="rectangular" height="200px" style={{ borderRadius: "12px" }} animation="wave" />
                    ))
                    :
                    (products.length === 0) ?
                        <Typography variant="body2" color="text.secondary">No hay sugerencias disponibles</Typography>
                        :
                        products.map((product) => {
                            const maxTrendValue = getMaxTrendValue(product.trendData);
                            const chartHeight = 40;

                            return (
                                <ProductItem key={product.id}>
                                    <Stack direction="row" spacing={1}>
                                        {product.imageUrl ? (
                                            <ProductImage src={product.imageUrl} alt={product.name} />
                                        ) : (
                                            <ImagePlaceholder />
                                        )}
                                        <Stack spacing={0.5}>
                                            <Typography variant="subtitle1" fontWeight={600}>{product.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">{product.sku}</Typography>
                                        </Stack>
                                    </Stack>

                                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                        <Stack>
                                            <Typography variant="body2">{product.currentStock} unidades</Typography>
                                        </Stack>
                                        <Stack spacing={0.5}>
                                            <Typography variant="body2" color="text.secondary">Últ. año</Typography>
                                            <Typography variant="body1" fontWeight={500}>{product.demandData.lastYear}</Typography>
                                        </Stack>
                                        <Stack spacing={0.5}>
                                            <Typography variant="body2" color="text.secondary">Últ. mes</Typography>
                                            <Typography variant="body1" fontWeight={500}>{product.demandData.lastMonth}</Typography>
                                        </Stack>
                                        <Stack spacing={0.5}>
                                            <Typography variant="body2" color="text.secondary">Mes act.</Typography>
                                            <Typography variant="body1" fontWeight={500}>{product.demandData.currentMonth}</Typography>
                                        </Stack>
                                    </Stack>

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
                                                                `L ${(index * 100) / (product.trendData.length - 1)},${chartHeight - normalizeTrendValue(point.value, maxTrendValue, chartHeight)
                                                                }`
                                                        )
                                                        .join(" ")} L ${100},${chartHeight} Z`}
                                                    fill={`url(#gradient-${product.id})`}
                                                />
                                                <TrendLine
                                                    d={`M ${product.trendData
                                                        .map(
                                                            (point, index) =>
                                                                `${(index * 100) / (product.trendData.length - 1)},${chartHeight - normalizeTrendValue(point.value, maxTrendValue, chartHeight)
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
                                            {
                                                product.trendData.map((point, index) => (
                                                    <TrendMonth key={index}>{point.month}</TrendMonth>
                                                ))
                                            }
                                        </TrendAxis>
                                    </TrendChartContainer>
                                </ProductItem>
                            )
                        })
            }
        </>
    );
}
