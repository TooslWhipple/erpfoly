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
  /** Total credit limit (credit line) */
  creditLimit: number;
  /** Amount of credit already used */
  creditUsed: number;
  /** Amount of credit available (optional, defaults to creditLimit - creditUsed) */
  creditAvailable?: number;
  /** Title above the bar (default: "Límite de crédito") */
  title?: string;
  /** Label for available amount (default: "Disponible:") */
  availableLabel?: string;
  /** Label for used amount (default: "Usado:") */
  usedLabel?: string;
}

export function CreditLimitBar({
  creditLimit,
  creditUsed,
  creditAvailable = undefined,
  title = "Límite de crédito",
  availableLabel = "Disponible:",
  usedLabel = "Crédito utilizado:",
}: CreditLimitBarProps) {
  const available =
    creditAvailable !== undefined ? creditAvailable : Math.max(0, creditLimit - creditUsed);
  const progressValue =
    creditLimit > 0 ? Math.min(100, (creditUsed / creditLimit) * 100) : 0;

  return (
    <CreditLimitBarRoot>
      <Stack>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body1">{formatCurrency(creditLimit)}</Typography>
      </Stack>
      <CreditLimitProgress variant="determinate" value={progressValue} />
      <CreditLimitLabelsRow>
        <Typography variant="body2">
          {usedLabel} <strong>{formatCurrency(creditUsed)}</strong>
        </Typography>
        <Typography variant="body2">
          {availableLabel} <strong>{formatCurrency(available)}</strong>
        </Typography>
      </CreditLimitLabelsRow>
    </CreditLimitBarRoot>
  );
}
