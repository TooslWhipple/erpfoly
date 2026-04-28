import numeral from "numeral";
import {
  CreditLimitBarRoot,
  CreditLimitBarTitle,
  CreditLimitProgress,
  CreditLimitLabelsRow,
  CreditLimitLabel,
} from "./styles";
import { Stack, Typography } from "@mui/material";

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export interface CreditLimitBarProps {
  creditLimit: number;
  creditUsed: number;
  creditAvailable?: number;
  availableLabel?: string;
  usedLabel?: string;
}

export function CreditLimitBar({
  creditLimit,
  creditUsed,
  creditAvailable = undefined,
  availableLabel = "Crédito disponible",
  usedLabel = "Crédito utilizado",
}: CreditLimitBarProps) {
  const available =
    creditAvailable !== undefined ? creditAvailable : Math.max(0, creditLimit - creditUsed);
  const progressValue =
    creditLimit > 0 ? Math.min(100, (creditUsed / creditLimit) * 100) : 0;

  return (
    <CreditLimitBarRoot>
      <Stack direction="row" justifyContent="space-between">
        <Stack>
          <Typography variant="body2" fontWeight={600}>{formatCurrency(creditUsed)}</Typography>
          <Typography variant="body2" color="text.secondary">{usedLabel}</Typography>
        </Stack>
        <Stack>
          <Typography variant="body2" fontWeight={600}>{formatCurrency(available)}</Typography>
          <Typography variant="body2" color="text.secondary">{availableLabel}</Typography>
        </Stack>
      </Stack>
      <CreditLimitProgress variant="determinate" value={progressValue} />
    </CreditLimitBarRoot>
  );
}
