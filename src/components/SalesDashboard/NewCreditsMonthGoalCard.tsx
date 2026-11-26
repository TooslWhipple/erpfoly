import { Box, Stack, Typography } from "@mui/material";
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
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          width: "100%",
        }}
      >
        <Stack direction="row" spacing={3} useFlexGap sx={{ flex: "1 1 auto" }}>
          <Stack spacing={0.5}>
            <WalletCards
              strokeWidth={2}
              size={16}
              color={theme.palette.text.secondary}
            />
            <Typography variant="h4" fontWeight={600} sx={{ whiteSpace: "nowrap" }}>
              {numeral(thisMonth).format("$0,0.00")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nuevos créditos
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            <WalletCards
              strokeWidth={2}
              size={16}
              color={theme.palette.text.secondary}
            />
            <Typography variant="h4" fontWeight={600} sx={{ whiteSpace: "nowrap" }}>
              {numeral(goal).format("$0,0.00")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Meta
            </Typography>
          </Stack>
        </Stack>
        <Box sx={{ flex: "1 1 220px", minWidth: 0, overflow: "hidden" }}>
          <MonthGoalProgressChart
            series={series}
            thisMonth={thisMonth}
            goal={goal}
            formatValue={(v) => numeral(v).format("$0,0.00")}
          />
        </Box>
      </Box>
    </Card>
  );
}
