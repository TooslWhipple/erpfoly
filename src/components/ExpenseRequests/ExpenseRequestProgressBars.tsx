import { LinearProgress, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import numeral from "numeral";

const ProgressTrack = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 999,
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 999,
  },
}));

export interface ExpenseRequestProgressBarsProps {
  verifiedAmount: number;
  requestedAmount: number;
  stacked?: boolean;
}

function clampPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (value / total) * 100));
}

export function ExpenseRequestProgressBars({
  verifiedAmount,
  requestedAmount,
  stacked = false,
}: ExpenseRequestProgressBarsProps) {
  const verifiedPercent = clampPercent(verifiedAmount, requestedAmount);

  return (
    <Stack
      direction={stacked ? "column" : { xs: "column", sm: "row" }}
      spacing={2}
      width="100%"
    >
      <Stack spacing={0.75} flex={1}>
        <ProgressTrack
          variant="determinate"
          value={verifiedPercent}
          color={verifiedPercent >= 100 ? "success" : "primary"}
        />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" fontWeight={600}>
            Comprobado: {numeral(verifiedAmount).format("$0,0.00")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {verifiedPercent.toFixed(0)}%
          </Typography>
        </Stack>
      </Stack>
      <Stack spacing={0.75} flex={1}>
        <Typography variant="body2" color="text.secondary">
          Solicitado: {numeral(requestedAmount).format("$0,0.00")}
        </Typography>
      </Stack>
    </Stack>
  );
}

