import { useId } from "react";
import { Stack, Typography } from "@mui/material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import numeral from "numeral";
import { theme } from "@/styles/theme";
import {
  buildProgressData,
  progressDataFromDailySeries,
} from "./buildProgressData";

export interface MonthGoalProgressChartProps {
  /**
   * Running total per day of the month (index 0 = day 1, `null` = day still
   * to come). Without it the chart falls back to a synthetic curve.
   */
  series?: Array<number | null>;
  thisMonth: number;
  goal: number;
  /** Formats the value in the tooltip (money or count). */
  formatValue: (value: number) => string;
}

function ProgressTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: Array<{ value: number | null }>;
  label?: number;
  formatValue: (value: number) => string;
}) {
  const value = payload?.[0]?.value;
  if (!active || value == null || label == null) return null;
  return (
    <Stack
      sx={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.app.border}`,
        borderRadius: 1,
        px: 1.25,
        py: 0.75,
        boxShadow: 1,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Día {label}
      </Typography>
      <Typography variant="caption" fontWeight={600}>
        {formatValue(value)}
      </Typography>
    </Stack>
  );
}

/** Month-to-date progress against the goal (dashed red line). */
export function MonthGoalProgressChart({
  series,
  thisMonth,
  goal,
  formatValue,
}: MonthGoalProgressChartProps) {
  const reactId = useId();
  const gradientId = `monthProgressFill-${reactId.replace(/:/g, "")}`;
  const data = series
    ? progressDataFromDailySeries(series, goal)
    : buildProgressData(thisMonth, goal);

  return (
    <Stack height="100%" minHeight={104} justifyContent="flex-end">
      <ResponsiveContainer width="100%" height={104}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2663EB" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#C0DBFE" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.palette.app.border}
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={{ stroke: theme.palette.app.border }}
            tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
            tickFormatter={(v) => `D${v}`}
            interval="preserveStartEnd"
            minTickGap={12}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tickFormatter={(v) => numeral(v).format("0a")}
            domain={[0, Math.max(thisMonth, goal, 1) * 1.15]}
          />
          {series && (
            <Tooltip
              content={<ProgressTooltip formatValue={formatValue} />}
              cursor={{ stroke: theme.palette.app.border }}
            />
          )}
          <ReferenceLine
            y={goal}
            stroke="#DC2626"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="#2663EB"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            connectNulls={false}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Stack>
  );
}
