import { Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { StyledProgressBar } from "@/styles/cajas.styles";
import { getCashLimitLevel, getCashLimitProgress } from "@/utils/cashLimit";

export interface CashInDrawerMeterProps {
  currentCash: number;
  limit: number;
  compact?: boolean;
  hideAmounts?: boolean;
}

export function CashInDrawerMeter({
  currentCash,
  limit,
  compact = false,
  hideAmounts = false,
}: CashInDrawerMeterProps) {
  const level = getCashLimitLevel(currentCash, limit);
  const progress = getCashLimitProgress(currentCash, limit);

  return (
    <Stack spacing={compact ? 0.25 : 0.4} sx={{ minWidth: 0, width: "100%" }}>
      <StyledProgressBar
        variant="determinate"
        value={progress}
        level={level}
        sx={compact ? { height: 6 } : undefined}
      />
      {!hideAmounts && (
        <Stack direction="row" justifyContent="space-between" spacing={0.5} minWidth={0}>
          <Typography
            variant={compact ? "caption" : "body2"}
            color="text.secondary"
            noWrap
          >
            {numeral(currentCash).format("$0,0.00")}
          </Typography>
          <Typography
            variant={compact ? "caption" : "body2"}
            color="text.secondary"
            noWrap
          >
            {numeral(limit).format("$0,0.00")}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
