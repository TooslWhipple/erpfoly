import { Stack, Typography } from "@mui/material";
import { TrendingUp as TrendingUpIcon } from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import type { SalesData } from "@/types/inventario.types";
import {
    SalesChartContainer,
    SalesIcon,
} from "./styles";

export interface SalesChartProps {
    data: SalesData;
}

export function SalesChart({ data }: SalesChartProps) {
    return (
        <SalesChartContainer>
            <Stack direction={{ xs: 'row', md: 'column' }} alignItems={{ xs: 'center', md: 'flex-start' }} spacing={1}>
                <SalesIcon>
                    <TrendingUpIcon />
                </SalesIcon>
                <Stack>
                    <Typography variant="subtitle1">Ventas del último mes</Typography>
                    <Typography variant="h2" sx={{ color: "#16A34A" }}>{data.lastMonth}</Typography>
                    <Typography variant="body2" color="text.secondary">+ {data.percentageChange}% del mes anterior</Typography>
                </Stack>
            </Stack>
            <Stack flex={{ xs: "none", md: 1 }} sx={{ width: "100%", minWidth: 0, height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data.monthlyData}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            </Stack>
        </SalesChartContainer>
    );
}
