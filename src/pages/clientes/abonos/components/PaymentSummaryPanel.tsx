import { Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { InnerCard } from "@/styles/clientes/abonos.styles";

export interface PaymentSummaryPanelProps {
  subtotal: number;
  totalIva: number;
  totalDue: number;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function PaymentSummaryPanel({
  subtotal,
  totalIva,
  totalDue,
}: PaymentSummaryPanelProps) {
  return (
    <InnerCard gap="8px">
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">Subtotal</Typography>
        <Typography variant="body2">{formatCurrency(subtotal)}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">IVA</Typography>
        <Typography variant="body2">{formatCurrency(totalIva)}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" fontWeight={700}>Total a cobrar</Typography>
        <Typography variant="h5" fontWeight={700}>{formatCurrency(totalDue)}</Typography>
      </Stack>
    </InnerCard>
  );
}

const PaymentSummaryPanelPage = () => null;

export default PaymentSummaryPanelPage;
