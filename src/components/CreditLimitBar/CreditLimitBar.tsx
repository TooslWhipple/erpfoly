import numeral from "numeral";
import { Lock } from "lucide-react";
import {
  CreditLimitBarRoot,
  CreditLimitProgress,
} from "./styles";
import { Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export interface CreditLimitBarProps {
  creditLimit: number;
  creditUsed: number;
  creditAvailable?: number;
  availableLabel?: string;
  usedLabel?: string;
  /** Shows a lock icon next to the available credit amount. */
  showAvailableLock?: boolean;
  /** Renders available amount with secondary (muted) color. */
  mutedAvailable?: boolean;
  /** Color of the used portion of the progress bar. */
  barColor?: string;
}

export function CreditLimitBar({
  creditLimit,
  creditUsed,
  creditAvailable = undefined,
  availableLabel = "Crédito disponible",
  usedLabel = "Crédito utilizado",
  showAvailableLock = false,
  mutedAvailable = false,
  barColor,
}: CreditLimitBarProps) {
  const theme = useTheme();
  const available =
    creditAvailable !== undefined ? creditAvailable : Math.max(0, creditLimit - creditUsed);
  const progressValue =
    creditLimit > 0 ? Math.min(100, (creditUsed / creditLimit) * 100) : 0;
  const resolvedBarColor = barColor ?? theme.palette.primary.dark;

  return (
    <CreditLimitBarRoot>
      <Stack direction="row" justifyContent="space-between">
        <Stack>
          <Typography variant="body2" fontWeight={600}>{formatCurrency(creditUsed)}</Typography>
          <Typography variant="body2" color="text.secondary">{usedLabel}</Typography>
        </Stack>
        <Stack alignItems="flex-end">
          <Stack direction="row" spacing={0.5} alignItems="center">
            {showAvailableLock ? (
              <Lock size={14} color={theme.palette.text.secondary} />
            ) : null}
            <Typography
              variant="body2"
              fontWeight={600}
              color={mutedAvailable ? "text.secondary" : undefined}
            >
              {formatCurrency(available)}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">{availableLabel}</Typography>
        </Stack>
      </Stack>
      <CreditLimitProgress
        variant="determinate"
        value={progressValue}
        sx={{
          "& .MuiLinearProgress-bar": {
            backgroundColor: resolvedBarColor,
          },
        }}
      />
    </CreditLimitBarRoot>
  );
}
