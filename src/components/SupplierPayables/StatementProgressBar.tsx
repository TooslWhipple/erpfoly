import { Stack, Typography } from "@mui/material";
import { ProgressTrack } from "./styles";
import numeral from "numeral";

export interface StatementProgressBarProps {
  paidAmount: number;
  totalAmount: number;
}

function clampPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (value / total) * 100));
}

export function StatementProgressBar({
  paidAmount,
  totalAmount,
}: StatementProgressBarProps) {
  const percent = clampPercent(paidAmount, totalAmount);
  const complete = totalAmount > 0 && paidAmount >= totalAmount;

  return (
    <Stack spacing={1} width="100%">
      <ProgressTrack
        variant="determinate"
        value={percent}
        color={complete ? "success" : "primary"}
      />
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Typography variant="body2" fontWeight={600}>
          Pagado: {numeral(paidAmount).format("$0,0.00")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total {numeral(totalAmount).format("$0,0.00")}
        </Typography>
      </Stack>
    </Stack>
  );
}
