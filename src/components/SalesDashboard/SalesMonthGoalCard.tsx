import { Grid, Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { BadgeDollarSign } from "lucide-react";
import { Card } from "@/styles/catalogos/goals.styles";
import { theme } from "@/styles/theme";
import { MonthGoalProgressChart } from "./MonthGoalProgressChart";

export interface SalesMonthGoalCardProps {
  thisMonth: number;
  goal: number;
  /** Running total per day of the month; see `MonthGoalProgressChart`. */
  series?: Array<number | null>;
  /** Caption under the sales amount; defaults to the current month. */
  periodLabel?: string;
}

export function SalesMonthGoalCard({
  thisMonth,
  goal,
  series,
  periodLabel = "Este mes",
}: SalesMonthGoalCardProps) {
  return (
    <Card>
      <Grid container width="100%" spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack spacing={0.5}>
            <BadgeDollarSign strokeWidth={2} size={16} color={theme.palette.text.secondary} />
            <Typography variant="h4" fontWeight={600}>{numeral(thisMonth).format("$0,0.00")}</Typography>
            <Typography variant="body2" color="text.secondary">{periodLabel}</Typography>
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
          <MonthGoalProgressChart
            series={series}
            thisMonth={thisMonth}
            goal={goal}
            formatValue={(v) => numeral(v).format("$0,0.00")}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
