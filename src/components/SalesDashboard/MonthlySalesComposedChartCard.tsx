import type { ReactNode } from "react";
import { Stack, Typography } from "@mui/material";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import numeral from "numeral";
import { Card, ChartWrapper } from "@/styles/catalogos/goals.styles";
import { colors } from "@/styles/theme";
import type { MonthlySalesPoint } from "@/types/sucursales.types";
import { SalesDashboardChartTooltip } from "./SalesDashboardChartTooltip";

export interface MonthlySalesComposedChartCardProps {
  data: MonthlySalesPoint[];
  title: string;
  headerEnd?: ReactNode;
}

export function MonthlySalesComposedChartCard({
  data,
  title,
  headerEnd,
}: MonthlySalesComposedChartCardProps) {
  return (
    <Card>
      <Stack width="100%" spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
          <Typography variant="h6">{title}</Typography>
          {headerEnd}
        </Stack>
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: colors.border }}
                tick={{ fontSize: 12, fill: colors.text.secondary }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => numeral(v).format("0a")}
              />
              <Tooltip content={<SalesDashboardChartTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 8 }}
                formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
                iconType="rect"
                iconSize={10}
              />
              <Bar dataKey="sales" name="Ventas" fill="#C0DBFE" radius={[4, 4, 0, 0]} barSize={80} />
              <Line
                type="monotone"
                dataKey="goal"
                name="Metas"
                stroke="#DC2626"
                strokeWidth={3}
                dot={{ r: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </Stack>
    </Card>
  );
}
