
import { Button, Grid, Stack, Typography } from "@mui/material";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { theme } from "@/styles/theme";
import type { ProductSuggestion } from "@/types/suggestions.types";
import { SuggestionCard, ProductImage } from "./styles";

export interface ProductSuggestionCardProps {
    product: ProductSuggestion;
    onAdd?: (product: ProductSuggestion) => void;
}

const CHART_HEIGHT_PX = 80;

export function ProductSuggestionCard({ product, onAdd }: ProductSuggestionCardProps) {
    const chartData =
        product.trendData.length > 0
            ? product.trendData
            : [{ month: "—", value: 0 }];

    const handleAdd = () => {
        if (onAdd) {
            onAdd(product);
        }
    };

    return (
        <SuggestionCard>
            <Stack direction="row" spacing={1} alignItems="center">
                <ProductImage />
                <Stack>
                    <Typography variant="body1" fontWeight={600}>{product.name}</Typography>
                    <Typography variant="caption" fontWeight={400} color="text.secondary">{product.sku}</Typography>
                </Stack>
            </Stack>
            <Typography variant="subtitle2" fontWeight={600}>{product.currentStock} unidades</Typography>

            <Grid container spacing={1}>
                <Grid size="grow">
                    <Typography variant="caption" sx={{ fontSize: 11 }}>
                        Últ. año
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.demandData.lastYear}
                    </Typography>
                </Grid>
                <Grid size="grow">
                    <Typography variant="caption" sx={{ fontSize: 11 }}>
                        Últ. mes
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.demandData.lastMonth}
                    </Typography>
                </Grid>
                <Grid size="grow">
                    <Typography variant="caption" sx={{ fontSize: 11 }}>
                        Mes act.
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.demandData.currentMonth}
                    </Typography>
                </Grid>
            </Grid>

            <Stack spacing={0.5}>
                <ResponsiveContainer width="100%" height={CHART_HEIGHT_PX}>
                    <AreaChart
                        data={chartData}>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={theme.palette.primary.main}
                            strokeWidth={2}
                            fill={theme.palette.primary.main}
                            fillOpacity={0.2}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                <Stack direction="row" justifyContent="space-between" spacing={0.5}>
                    {
                        product.trendData.map((point, index) => (
                            <Typography key={index} variant="caption">{point.month}</Typography>
                        ))
                    }
                </Stack>
            </Stack>

            <Button
                variant="text"
                color="primary"
                onClick={handleAdd} fullWidth>
                Agregar
            </Button>
        </SuggestionCard>
    );
}
