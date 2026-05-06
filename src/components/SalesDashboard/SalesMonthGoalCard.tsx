import { useId } from "react";
import { Grid, Stack, Typography } from "@mui/material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import numeral from "numeral";
import { BadgeDollarSign } from "lucide-react";
import { Card } from "@/styles/catalogos/goals.styles";
import { theme } from "@/styles/theme";
import { buildProgressData } from "./buildProgressData";

export interface SalesMonthGoalCardProps {
  thisMonth: number;
  goal: number;
}

export function SalesMonthGoalCard({ thisMonth, goal }: SalesMonthGoalCardProps) {
  const reactId = useId();
  const gradientId = `progressFill-${reactId.replace(/:/g, "")}`;

  return (
    <Card>
      <Grid container width="100%" spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack spacing={0.5}>
            <BadgeDollarSign strokeWidth={2} size={16} color={theme.palette.text.secondary} />
            <Typography variant="h4" fontWeight={600}>{numeral(thisMonth).format("$0,0.00")}</Typography>
            <Typography variant="body2" color="text.secondary">Este mes</Typography>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack spacing={0.5}>
            <BadgeDollarSign strokeWidth={2} size={16} color={theme.palette.text.secondary} />
            <Typography variant="h4" fontWeight={600}>
              {numeral(goal).format("$0,0.00")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Meta
            </Typography>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack height="100%" minHeight={104} justifyContent="flex-end">
            <ResponsiveContainer width="100%" height={104}>
              <AreaChart
                data={buildProgressData(thisMonth, goal)}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2663EB" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#C0DBFE" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.app.border} vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={{ stroke: theme.palette.app.border }}
                  tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                  tickFormatter={(v) => `D${v}`}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => numeral(v).format("0a")}
                  domain={[0, Math.max(thisMonth, goal, 1) * 1.15]}
                />
                <ReferenceLine y={goal} stroke="#DC2626" strokeWidth={2} strokeDasharray="4 4" />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#2663EB"
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
}
