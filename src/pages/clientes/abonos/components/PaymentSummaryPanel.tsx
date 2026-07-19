import { Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { InnerCard } from "@/styles/clientes/abonos.styles";

export interface PaymentSummaryPanelProps {
  totalOutstanding: number;
  paymentAmount: number;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function PaymentSummaryPanel({
  totalOutstanding,
  paymentAmount,
}: PaymentSummaryPanelProps) {
  const amountToApply = Math.min(Math.max(paymentAmount, 0), totalOutstanding);
  const remainingAfterPayment = Math.max(totalOutstanding - amountToApply, 0);

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
