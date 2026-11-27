import { Box, Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { CreditCard } from "lucide-react";
import { Card } from "@/styles/catalogos/goals.styles";
import { theme } from "@/styles/theme";
import { MonthGoalProgressChart } from "./MonthGoalProgressChart";

export interface CreditsMonthGoalCardProps {
  thisMonth: number;
  goal: number;
  /** Running total per day of the month; see `MonthGoalProgressChart`. */
  series?: Array<number | null>;
}

export function CreditsMonthGoalCard({
  thisMonth,
  goal,
  series,
}: CreditsMonthGoalCardProps) {
  return (
    <Card>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          width: "100%",
        }}
      >
        <Stack spacing={0.5} sx={{ flex: "1 1 auto" }}>
          <CreditCard
            strokeWidth={2}
            size={16}
            color={theme.palette.text.secondary}
          />
          <Typography variant="h4" fontWeight={600} sx={{ whiteSpace: "nowrap" }}>
            {numeral(thisMonth).format("0,0")} de {numeral(goal).format("0,0")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Créditos aprobados
          </Typography>
        </Stack>
        <Box sx={{ flex: "1 1 220px", minWidth: 0, overflow: "hidden" }}>
          <MonthGoalProgressChart
            series={series}
            thisMonth={thisMonth}
            goal={goal}
            formatValue={(v) => numeral(v).format("0,0")}
          />
        </Box>
      </Box>
    </Card>
  );
}
