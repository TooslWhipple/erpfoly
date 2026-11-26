import { Grid, Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { WalletCards } from "lucide-react";
import { Card } from "@/styles/catalogos/goals.styles";
import { theme } from "@/styles/theme";
import { MonthGoalProgressChart } from "./MonthGoalProgressChart";

export interface NewCreditsMonthGoalCardProps {
  thisMonth: number;
  goal: number;
  /** Running total per day of the month; see `MonthGoalProgressChart`. */
  series?: Array<number | null>;
}

export function NewCreditsMonthGoalCard({
  thisMonth,
  goal,
  series,
}: NewCreditsMonthGoalCardProps) {
  return (
    <Card>
      <Grid container width="100%" spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack spacing={0.5}>
            <WalletCards
              strokeWidth={2}
              size={16}
              color={theme.palette.text.secondary}
            />
            <Typography variant="h4" fontWeight={600}>
              {numeral(thisMonth).format("$0,0.00")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nuevos créditos
            </Typography>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack spacing={0.5}>
            <WalletCards
              strokeWidth={2}
              size={16}
              color={theme.palette.text.secondary}
            />
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
