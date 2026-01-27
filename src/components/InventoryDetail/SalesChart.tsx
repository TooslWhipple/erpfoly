import { Box, Stack, Typography } from "@mui/material";
import { TrendingUp as TrendingUpIcon } from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import type { SalesData } from "@/types/inventario.types";
import {
    SalesChartContainer,
    SalesHeader,
    SalesIcon,
    SalesMetric,
    ChartContainer,
} from "./styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SalesChartProps {
    data: SalesData;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SalesChart({ data }: SalesChartProps) {
    return (
        <SalesChartContainer>
            <SalesHeader>
                <SalesIcon>
                    <TrendingUpIcon />
                </SalesIcon>
                <Stack direction="column">
                    <Typography variant="subtitle1" color="text.secondary">
                        Ventas del último mes
                    </Typography>
                    <Typography variant="h1" sx={{ fontWeight: 700, color: "#16A34A" }}>
                        {data.lastMonth}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        + {data.percentageChange}% del mes anterior
                    </Typography>
                </Stack>
            </SalesHeader>

            <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data.monthlyData}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis
                            dataKey="monthShort"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#6B7280" }}
                            interval={0}
                        />
                        <YAxis
                            domain={[0, 30]}
                            ticks={[5, 10, 20, 30]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#6B7280" }}
                        />
                        <Bar
                            dataKey="sales"
                            fill="#DBEAFE"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </SalesChartContainer>
    );
}
