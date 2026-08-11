import { Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { ProgressTrack } from "./styles";

export interface ExpenseProgressBarsProps {
  paidAmount: number;
  invoicesAmount: number;
  totalAmount: number;
  stacked?: boolean;
}

function clampPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (value / total) * 100));
}

export function ExpenseProgressBars({
  paidAmount,
  invoicesAmount,
  totalAmount,
  stacked = false,
}: ExpenseProgressBarsProps) {
  const paidPercent = clampPercent(paidAmount, totalAmount);
  const invoicesPercent = clampPercent(invoicesAmount, totalAmount);

  return (
    <Stack
      direction={stacked ? "column" : { xs: "column", sm: "row" }}
      spacing={2}
      width="100%"
    >
      <Stack spacing={0.75} flex={1}>
        <ProgressTrack variant="determinate" value={paidPercent} color="primary" />
        <Typography variant="body2" fontWeight={600}>
          Pagado: {numeral(paidAmount).format("$0,0.00")}
        </Typography>
      </Stack>
      <Stack spacing={0.75} flex={1}>
        <ProgressTrack
          variant="determinate"
          value={invoicesPercent}
          color="primary"
        />
        <Typography variant="body2" color="text.secondary">
          Facturas {numeral(invoicesAmount).format("$0,0.00")}
        </Typography>
      </Stack>
    </Stack>
  );
}
