import { Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { InnerCard } from "@/styles/clientes/abonos.styles";

export interface PaymentSummaryPanelProps {
  totalOutstanding: number;
  paymentAmount: number;
  collectableAmount?: number;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function PaymentSummaryPanel({
  totalOutstanding,
  paymentAmount,
  collectableAmount,
}: PaymentSummaryPanelProps) {
  const cap = collectableAmount ?? totalOutstanding;
  const amountToApply = Math.min(Math.max(paymentAmount, 0), cap);
  const remainingAfterPayment = Math.max(
    totalOutstanding - Math.min(amountToApply, totalOutstanding),
    0,
  );

  return (
    <InnerCard gap="8px">
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">Saldo pendiente total</Typography>
        <Typography variant="body2">{formatCurrency(totalOutstanding)}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">Saldo restante tras este abono</Typography>
        <Typography variant="body2">{formatCurrency(remainingAfterPayment)}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" fontWeight={700}>Monto a abonar</Typography>
        <Typography variant="h5" fontWeight={700}>{formatCurrency(amountToApply)}</Typography>
      </Stack>
    </InnerCard>
  );
}

const PaymentSummaryPanelPage = () => null;

export default PaymentSummaryPanelPage;
